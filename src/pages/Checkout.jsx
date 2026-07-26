// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ArrowLeft, Loader2, ShieldCheck, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import { loadSelectedRoute, loadSearch, clearBookingFlow } from '@/lib/searchStorage';
import { saveTrip } from '@/lib/tripStorage';
import { priceOffer, createPaymentIntent, createBooking } from '@/components/api/flightClient';
import { loadUserProfile } from '@/lib/profileStorage';
import { supabase } from '@/lib/supabaseClient';


function normalizePhoneToE164(raw) {
  if (!raw) return '';
  const stripped = raw.replace(/[^\d+]/g, ''); // keep only '+' and digits
  const hasPlus = stripped.startsWith('+');
  const digitsOnly = stripped.replace(/\+/g, '');
  return (hasPlus ? '+' : '+') + digitsOnly; // always prefix with '+'
}

function isValidE164(phone) {
  return /^\+[1-9]\d{6,14}$/.test(phone); // '+', 1-15 digits total, no leading 0
}

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

function splitFullName(fullName) {
  if (!fullName) return { given_name: '', family_name: '' };
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { given_name: parts[0], family_name: '' };
  return { given_name: parts.slice(0, -1).join(' '), family_name: parts[parts.length - 1] };
}

function PaymentForm({ route, clientSecret, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isPaying, setIsPaying] = useState(false);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsPaying(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: window.location.href,
        },
      });

      if (error) {
        toast.error(error.message || 'Payment failed.');
        setIsPaying(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        await onSuccess(paymentIntent.id);
      } else {
        toast.error(`Payment status: ${paymentIntent?.status}. Please try again.`);
      }
    } catch (err) {
      console.error('Checkout: payment failed:', err);
      toast.error(err.message || 'Payment failed.');
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-4">
      <PaymentElement />
      <Button type="submit" disabled={!stripe || isPaying} className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-base font-semibold">
        {isPaying ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing…</>) : (<>Pay ${Math.round(route.price)}</>)}
      </Button>
      <p className="text-xs text-center text-slate-400 flex items-center justify-center gap-1">
        <ShieldCheck className="w-3.5 h-3.5" /> Secured by Stripe · Test mode
      </p>
    </form>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const route = loadSelectedRoute();
  const search = loadSearch();
  const [searchParams] = useSearchParams();

  const [passenger, setPassenger] = useState({ title: '', given_name: '', family_name: '', born_on: '', email: '', phone_number: '', gender: '' });
  const [step, setStep] = useState('details');
  const [pricing, setPricing] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [booking, setBooking] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    const paymentIntentId = searchParams.get('payment_intent');
    const status = searchParams.get('redirect_status');

    if (paymentIntentId && status === 'succeeded' && step !== 'confirmed') {
      handlePaymentSuccess(paymentIntentId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!route) navigate(createPageUrl('Home'));
  }, [route, navigate]);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: { user } }, { travel_profiles, active_profile_id }] = await Promise.all([
          supabase.auth.getUser(),
          loadUserProfile(),
        ]);

        const activeProfile = travel_profiles?.find((p) => String(p.id) === String(active_profile_id))
          || travel_profiles?.[0]
          || null;

        if (activeProfile || user) {
          const { given_name, family_name } = splitFullName(activeProfile?.full_name);
          setPassenger((prev) => ({
            id: prev.id || route?.passengerId || activeProfile?.passenger_id,
            title: prev.title || activeProfile?.title,
            given_name: prev.given_name || given_name,
            family_name: prev.family_name || family_name,
            born_on: prev.born_on || activeProfile?.date_of_birth || '',
            email: prev.email || user?.email || '',
            phone_number: prev.phone_number || activeProfile?.phone_number || '',
            gender: prev.gender || activeProfile?.gender || '',
          }));
        }
      } catch (err) {
        console.warn('Checkout: could not prefill from profile:', err);
      } finally {
        setProfileLoaded(true);
      }
    })();
  }, []);

  if (!route) return null;

  const handleContinueToPayment = async (e) => {
    e.preventDefault();

    const normalizedPhone = normalizePhoneToE164(passenger.phone_number)

    if (!passenger.title || !passenger.given_name || !passenger.family_name || !passenger.born_on || !passenger.email || !passenger.phone_number || !passenger.gender) {
      toast.error('Please fill in all passenger details including phone number.');
      return;
    }

    if(!isValidE164(normalizedPhone)){
      toast.error('Phone number must include a country code, e.g. +974XXXXXXXX (digits only).');
      return;
    }


    const updatedPassenger = { ...passenger, phone_number: normalizedPhone } 
    setPassenger(updatedPassenger);

    setIsPreparing(true);
    try {
      const priced = await priceOffer(route.id);
      setPricing(priced);

      const amountInCents = Math.round((priced.totalAmount ?? route.price) * 100);
      const intent = await createPaymentIntent({
        offerId: route.id,
        amount: amountInCents,
        currency: (priced.currency || route.currency || 'usd').toLowerCase(),
      });
      setClientSecret(intent.clientSecret);
      setStep('payment');
    } catch (err) {
      console.error('Checkout: failed to prepare payment:', err);
      toast.error(err.message || 'This offer may have expired — please search again.');
    } finally {
      setIsPreparing(false);
    }
  };

  const handlePaymentSuccess = async (confirmedPaymentIntentId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Ensure passenger object preserves any pre-assigned passenger ID
      const passengerPayload = {
        ...passenger,
        id: passenger.id || route?.passengerId,
        phone_number: normalizePhoneToE164(passenger.phone_number)
      };

      const result = await createBooking({
        offerId: route.id,
        passengers: [passengerPayload],
        paymentIntentId: confirmedPaymentIntentId,
        userId: user?.id,
      });

      const tripRecord = {
        id: result.bookingReference || result.orderId || `trip_${Date.now()}`,
        booking_reference: result.bookingReference || result.orderId,
        status: 'upcoming',
        origin: search?.origin,
        destination: search?.destination,
        departure_date: route.segments?.[0]?.departureTime || search?.departureDate,
        arrival_date: route.segments?.[route.segments.length - 1]?.arrivalTime,
        price: pricing?.totalAmount ?? route.price,
        currency: pricing?.currency ?? route.currency ?? 'USD',
        segments: route.segments,
        passengers: [passengerPayload],
        confirmation_email: passenger.email,
        shared_with: [],
      };
      saveTrip(tripRecord);

      setBooking(tripRecord);
      setStep('confirmed');
      clearBookingFlow();
      toast.success('Booking confirmed!');
    } catch (err) {
      console.error('Checkout: booking failed after payment:', err);
      toast.error('Payment succeeded, but booking creation failed. Please contact support with your payment reference.');
    }
  };

  if (step === 'confirmed' && booking) {
    return (
      <div className="min-h-screen bg-background dark:bg-slate-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Booking Confirmed</h2>
              <p className="text-sm text-slate-500 mt-1">Reference: {booking.booking_reference}</p>
            </div>
            <Button className="w-full" onClick={() => navigate(createPageUrl('TripDetails') + `?id=${booking.id}`)}>
              View Trip Details
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate(createPageUrl('MyTrips'))}>
              Go to My Trips
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950 pb-24">
      <div className="sticky top-0 z-40 bg-background/95 dark:bg-slate-950/95 backdrop-blur border-b border-border dark:border-slate-800">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">Checkout</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>{search?.origin?.city} → {search?.destination?.city}</span>
              <span className="text-xl font-bold">${Math.round(pricing?.totalAmount ?? route.price)}</span>
            </CardTitle>
          </CardHeader>
        </Card>

        {step === 'details' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                Passenger Details
                {profileLoaded && (passenger.given_name || passenger.email) && (
                  <span className="text-xs font-normal text-emerald-600 flex items-center gap-1 ml-2">
                    <User className="w-3 h-3" /> Filled from your profile
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContinueToPayment} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <select
                      id="title"
                      value={passenger.title}
                      onChange={(e) => setPassenger({ ...passenger, title: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800"
                      required
                    >
                      <option value="" disabled>Select Title</option>
                      <option value="mr">Mr.</option>
                      <option value="ms">Ms.</option>
                      <option value="mrs">Mrs.</option>
                      <option value="miss">Miss.</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <select
                      id="gender"
                      value={passenger.gender}
                      onChange={(e) => setPassenger({ ...passenger, gender: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800"
                      required
                    >
                      <option value="" disabled>Select Gender</option>
                      <option value="m">Male</option>
                      <option value="f">Female</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First name</Label>
                    <Input 
                      value={passenger.given_name} 
                      onChange={(e) => setPassenger({ ...passenger, given_name: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last name</Label>
                    <Input 
                      value={passenger.family_name} 
                      onChange={(e) => setPassenger({ ...passenger, family_name: e.target.value })} 
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Date of birth</Label>
                  <Input 
                    type="date" 
                    value={passenger.born_on} 
                    onChange={(e) => setPassenger({ ...passenger, born_on: e.target.value })} 
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Confirmation email</Label>
                  <Input 
                    type="email" 
                    value={passenger.email} 
                    onChange={(e) => setPassenger({ ...passenger, email: e.target.value })} 
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Phone number</Label>
                  <Input 
                    type="tel" 
                    placeholder="e.g. +1234567890" 
                    value={passenger.phone_number} 
                    onChange={(e) => setPassenger({ ...passenger, phone_number: e.target.value })} 
                    required 
                  />
                  <p className="text-xs text-slate-500">Digits after the country code - e.g. +974XXXXXXXX (no spaces or dashes)</p>
                </div>

                <Button type="submit" className="w-full text-white bg-sky-500 hover:bg-sky-600" disabled={isPreparing}>
                  {isPreparing ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Confirming price…</>
                  ) : (
                    'Continue to Payment'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 'payment' && clientSecret && stripePromise && (
          <Card>
            <CardHeader><CardTitle className="text-base">Payment</CardTitle></CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm route={route} clientSecret={clientSecret} onSuccess={handlePaymentSuccess} />
              </Elements>
            </CardContent>
          </Card>
        )}

        {step === 'payment' && !stripePromise && (
          <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950">
            <CardContent className="pt-6 text-sm text-amber-800 dark:text-amber-200">
              Stripe is not configured (missing VITE_STRIPE_PUBLISHABLE_KEY).
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}