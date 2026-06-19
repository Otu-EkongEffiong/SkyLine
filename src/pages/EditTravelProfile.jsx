import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, FileText, Shield, Check, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import PassportSelectorInput from '@/components/travel/PassportSelector.jsx';
import { getFlagEmoji } from '@/components/travel/PassportSelector';
import VisaManager from '@/components/travel/VisaManager';
import { useTranslation } from '@/components/translations';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function EditTravelProfile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Get profile data from navigation state
  const urlParams = new URLSearchParams(window.location.search);
  const profileData = urlParams.get('profile');
  const onUpdate = window.updateProfileCallback;
  const onDelete = window.deleteProfileCallback;
  const onSetActive = window.setActiveProfileCallback;
  const isActive = urlParams.get('isActive') === 'true';

  const [editedProfile, setEditedProfile] = useState(
    profileData ? JSON.parse(decodeURIComponent(profileData)) : {}
  );
  const [isSaved, setIsSaved] = useState(false);

  // Optimistic update: persist changes to localStorage immediately on every field change
  const handleFieldChange = (updates) => {
    const updated = { ...editedProfile, ...updates };
    setEditedProfile(updated);
    // Optimistically write to localStorage right away
    try {
      const raw = localStorage.getItem('skypath_user_profile');
      const storedProfile = raw ? JSON.parse(raw) : {};
      const travelProfiles = (storedProfile.travel_profiles || []).map(p =>
        p.id === updated.id ? updated : p
      );
      localStorage.setItem('skypath_user_profile', JSON.stringify({ ...storedProfile, travel_profiles: travelProfiles }));
    } catch {}
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(editedProfile);
    }
    setIsSaved(true);
    setTimeout(() => navigate(createPageUrl('Profile')), 150);
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Are you sure you want to delete this travel profile?')) {
      onDelete();
      navigate(createPageUrl('Profile'));
    }
  };

  const handleSetActive = () => {
    if (onSetActive) {
      onSetActive();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-6">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(createPageUrl('Profile'))}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  {editedProfile.profile_name || 'Travel Profile'}
                </h1>
                {isActive && (
                  <p className="text-xs text-emerald-600 font-medium">Active Profile</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {!isActive && (
                <Button size="sm" variant="outline" onClick={handleSetActive}>
                  Set Active
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Name */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>Profile Name</Label>
              <Input
                value={editedProfile.profile_name || ''}
                onChange={(e) => handleFieldChange({ profile_name: e.target.value })}
                placeholder="e.g., Primary Passport, Second Passport"
              />
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
              <User className="w-4 h-4" />
              Personal Information
            </div>
            
            <div className="space-y-2">
              <Label>Full Name (as on passport)</Label>
              <Input
                value={editedProfile.full_name || ''}
                onChange={(e) => handleFieldChange({ full_name: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={editedProfile.date_of_birth || ''}
                onChange={(e) => handleFieldChange({ date_of_birth: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Passport Information */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
              <FileText className="w-4 h-4" />
              Passport Details
            </div>

            <div className="space-y-2">
              <Label>{t('selectPassport')}</Label>
              <PassportSelectorInput
                value={editedProfile.passport_country}
                onChange={(countryCode, countryName) => 
                  handleFieldChange({ passport_country: countryCode, passport_country_name: countryName })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Passport Number</Label>
              <Input
                value={editedProfile.passport_number || ''}
                onChange={(e) => handleFieldChange({ passport_number: e.target.value })}
                placeholder="ABC123456"
              />
            </div>

            <div className="space-y-2">
              <Label>Passport Expiry Date</Label>
              <Input
                type="date"
                value={editedProfile.passport_expiry_date || ''}
                onChange={(e) => handleFieldChange({ passport_expiry_date: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Visas */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
              <Shield className="w-4 h-4" />
              {t('yourVisas')}
            </div>
            <VisaManager
              visas={editedProfile.visas || []}
              onVisasChange={(visas) => handleFieldChange({ visas })}
            />
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button
          className="w-full bg-emerald-600 hover:bg-emerald-700"
          size="lg"
          onClick={handleSave}
        >
          <Check className="w-5 h-5 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}