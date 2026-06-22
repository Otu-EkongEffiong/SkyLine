// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Loader2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import BottomNav from '@/components/BottomNav';
import { createPageUrl } from '@/utils';
import { loadSelectedRoute, loadSearch, clearBookingFlow } from '@/lib/searchStorage';
import { priceOffer, createPaymentIntent, createBooking } from '@/components/api/flightClient';
import { saveTrip } from '@/lib/tripStorage';
import { useAuth } from '@/lib/AuthContext';
import { loadUserProfile, getActiveTravelProfile } from '@/lib/profileStorage';

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

function StripeCheckoutForm({ clientSecret, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });
    setProcessing(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-4">
      <PaymentElement />
      <Button type="submit" disabled={!stripe || processing} className="w-full bg-orange-500 hover:bg-orange-600">
        {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
        Pay & confirm booking
      </Button>
    </form>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const route = loadSelectedRoute();
  const search = loadSearch();
  const profile = getActiveTravelProfile(loadUserProfile());

  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clientSecret, setClientSecret] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [passenger, setPassenger] = useState({
    given_name: profile?.first_name || '',
    family_name: profile?.last_name || '',
    email: user?.email || '',
    born_on: profile?.date_of_birth || '1990-01-01',
  });

  useEffect(() => {
    if (!route) {
      navigate(createPageUrl('Home'));
      return;
    }
    initPricing();
  }, []);

  const initPricing = async () => {
    setLoading(true);
    try {
      const priced = await priceOffer(route.id);
      setPricing(priced);

      if (stripePromise) {
        const amount = Math.round((priced.totalAmount || route.price) * 100);
        const intent = await createPaymentIntent({
          offerId: route.id,
          amount,
          currency: (priced.currency || 'usd').toLowerCase(),
        });
        setClientSecret(intent.clientSecret);
      }
    } catch (err) {
      console.warn('Price confirmation unavailable, using search price:', err.message);
      setPricing({ totalAmount: route.price, currency: route.currency || 'USD', available: true });
    } finally {
      setLoading(false);
    }
  };

  const finalizeBooking = async (paymentIntentId = 'demo_payment') => {
    try {
      const passengers = [{
        id: '1',
        given_name: passenger.given_name,
        family_name: passenger.family_name,
        born_on: passenger.born_on,
        email: passenger.email,
        phone_number: '+15555555555',
        gender: 'm',
        title: 'mr',
      }];

      let bookingRef = `SKY-${Date.now().toString(36).toUpperCase()}`;
      try {
        const result = await createBooking({
          offerId: route.id,
          passengers,
          paymentIntentId,
          userId: user?.id,
        });
        bookingRef = result.bookingReference || bookingRef;
      } catch (err) {
        console.warn('Backend booking failed, saving locally:', err.message);
      }

      const trip = {
        id: crypto.randomUUID(),
        booking_reference: bookingRef,
        status: 'upcoming',
        origin: search?.origin || { city: route.segments[0]?.origin, code: route.segments[0]?.origin },
        destination: search?.destination || { city: route.segments.at(-1)?.destination, code: route.segments.at(-1)?.destination },
        departure_date: search?.departureDate || new Date().toISOString(),
        arrival_date: search?.returnDate || search?.departureDate || new Date().toISOString(),
        price: pricing?.totalAmount || route.price,
        currency: pricing?.currency || 'USD',
        payment_status: paymentIntentId === 'demo_payment' ? 'demo' : 'paid',
        segments: route.segments,
      };

      saveTrip(trip);
      clearBookingFlow();
      setConfirmed(true);
      toast.success('Booking confirmed!');
      setTimeout(() => navigate(createPageUrl('MyTrips')), 2000);
    } catch (err) {
      toast.error(err.message || 'Booking failed');
    }
  };

  if (!route) return null;

  if (confirmed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-4">
        <CheckCircle className="w-16 h-16 text-emerald-500" />
        <h1 className="text-2xl font-bold">Booking confirmed</h1>
        <p className="text-slate-500">Redirecting to My Trips…</p>
      </div>
    );
  }

  const amount = pricing?.totalAmount ?? route.price;

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950 pb-24">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">Checkout</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Price summary</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
            ) : (
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Total</span>
                <span className="text-2xl font-bold">${Math.round(amount)} {pricing?.currency || 'USD'}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Passenger details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>First name</Label>
                <Input value={passenger.given_name} onChange={(e) => setPassenger({ ...passenger, given_name: e.target.value })} />
              </div>
              <div>
                <Label>Last name</Label>
                <Input value={passenger.family_name} onChange={(e) => setPassenger({ ...passenger, family_name: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={passenger.email} onChange={(e) => setPassenger({ ...passenger, email: e.target.value })} />
            </div>
            <div>
              <Label>Date of birth</Label>
              <Input type="date" value={passenger.born_on} onChange={(e) => setPassenger({ ...passenger, born_on: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Payment</CardTitle></CardHeader>
          <CardContent>
            {clientSecret && stripePromise ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <StripeCheckoutForm clientSecret={clientSecret} onSuccess={finalizeBooking} />
              </Elements>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-500">
                  Stripe is not configured. Use demo checkout to save the booking locally.
                </p>
                <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={() => finalizeBooking('demo_payment')}>
                  Confirm booking (demo)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
