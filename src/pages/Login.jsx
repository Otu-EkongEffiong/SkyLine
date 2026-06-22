// @ts-nocheck
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { createPageUrl } from '@/utils';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      toast.success('Welcome back!');
      navigate(createPageUrl('Home'));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-500 to-teal-600 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center mb-2">
            <Plane className="w-6 h-6 text-sky-600" />
          </div>
          <CardTitle>Sign in to SkyLine</CardTitle>
          <CardDescription>Access saved trips, profile, and bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input id="email" type="email" className="pl-9" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input id="password" type="password" className="pl-9" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>
            <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-600" disabled={loading}>
              Sign in
            </Button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-4">
            No account?{' '}
            <Link to={createPageUrl('Register')} className="text-sky-600 font-medium hover:underline">Create one</Link>
          </p>
          <Button variant="ghost" className="w-full mt-2" onClick={() => navigate(createPageUrl('Home'))}>
            Continue without signing in
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
