import React, { useState } from 'react';
import { Plus, X, Calendar, Shield, Check, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { COUNTRIES, getFlagEmoji } from './PassportSelector';
import { motion, AnimatePresence } from 'framer-motion';

// Generic visa types applicable to any country
const GENERIC_VISA_TYPES = [
  { value: "tourist", label: "Tourist Visa" },
  { value: "business", label: "Business Visa" },
  { value: "work", label: "Work Visa" },
  { value: "student", label: "Student Visa" },
  { value: "transit", label: "Transit Visa" },
  { value: "evisa", label: "e-Visa" },
  { value: "residence", label: "Residence Permit" },
];

// Country-specific visa types keyed by ISO country code
const COUNTRY_SPECIFIC_VISA_TYPES = {
  AU: [{ value: "australia_600", label: "Visitor Visa (Subclass 600)" }, { value: "australia_462", label: "Work and Holiday (Subclass 462)" }],
  BR: [{ value: "brazil_visitor", label: "Visitor Visa" }],
  CA: [{ value: "canada_trv", label: "Temporary Resident Visa (TRV)" }],
  CN: [{ value: "china_l", label: "Tourist Visa (L)" }, { value: "china_m", label: "Business Visa (M)" }],
  EG: [{ value: "egypt_tourist", label: "Tourist Visa" }],
  IE: [{ value: "ireland_c", label: "Short Stay (C) Visa" }],
  JP: [{ value: "japan_short", label: "Short-Term Stay Visa" }],
  MX: [{ value: "mexico_visitor", label: "Visitor Visa (FMM)" }],
  NZ: [{ value: "nz_visitor", label: "Visitor Visa" }],
  QA: [{ value: "qatar_tourist", label: "Tourist Visa" }],
  SA: [{ value: "saudi_evisa", label: "Tourist eVisa" }],
  // Schengen area countries
  AT: [{ value: "schengen", label: "Schengen Visa" }],
  BE: [{ value: "schengen", label: "Schengen Visa" }],
  CZ: [{ value: "schengen", label: "Schengen Visa" }],
  DK: [{ value: "schengen", label: "Schengen Visa" }],
  FI: [{ value: "schengen", label: "Schengen Visa" }],
  FR: [{ value: "schengen", label: "Schengen Visa" }],
  DE: [{ value: "schengen", label: "Schengen Visa" }],
  GR: [{ value: "schengen", label: "Schengen Visa" }],
  HU: [{ value: "schengen", label: "Schengen Visa" }],
  IS: [{ value: "schengen", label: "Schengen Visa" }],
  IT: [{ value: "schengen", label: "Schengen Visa" }],
  LI: [{ value: "schengen", label: "Schengen Visa" }],
  LU: [{ value: "schengen", label: "Schengen Visa" }],
  MT: [{ value: "schengen", label: "Schengen Visa" }],
  NL: [{ value: "schengen", label: "Schengen Visa" }],
  NO: [{ value: "schengen", label: "Schengen Visa" }],
  PL: [{ value: "schengen", label: "Schengen Visa" }],
  PT: [{ value: "schengen", label: "Schengen Visa" }],
  SK: [{ value: "schengen", label: "Schengen Visa" }],
  SI: [{ value: "schengen", label: "Schengen Visa" }],
  ES: [{ value: "schengen", label: "Schengen Visa" }],
  SE: [{ value: "schengen", label: "Schengen Visa" }],
  CH: [{ value: "schengen", label: "Schengen Visa" }],
  SG: [{ value: "singapore_visit", label: "Short-Term Visit Pass" }],
  ZA: [{ value: "south_africa_visitor", label: "Visitor Visa" }],
  KR: [{ value: "korea_c3", label: "Short-Term Visit Visa (C-3)" }],
  TH: [{ value: "thailand_tourist", label: "Tourist Visa" }],
  TR: [{ value: "turkey_evisa", label: "e-Visa" }],
  AE: [{ value: "uae_tourist", label: "Tourist Visa" }],
  GB: [{ value: "uk_visitor", label: "Standard Visitor Visa" }],
  US: [{ value: "us_b1b2", label: "B1/B2 Visitor Visa" }, { value: "us_f1", label: "F-1 Student Visa" }],
};

// All visa types (for displaying existing saved visas)
const ALL_VISA_TYPE_LABELS = {
  ...Object.fromEntries(GENERIC_VISA_TYPES.map(v => [v.value, v.label])),
  australia_600: "Australia Visitor Visa (Subclass 600)",
  australia_462: "Work and Holiday (Subclass 462)",
  brazil_visitor: "Brazil Visitor Visa",
  canada_trv: "Canada Temporary Resident Visa",
  china_l: "China Tourist Visa (L)",
  china_m: "China Business Visa (M)",
  egypt_tourist: "Egypt Tourist Visa",
  ireland_c: "Ireland Short Stay (C) Visa",
  japan_short: "Japan Short-Term Stay Visa",
  korea_c3: "South Korea Short-Term Visit Visa (C-3)",
  mexico_visitor: "Mexico Visitor Visa (FMM)",
  nz_visitor: "New Zealand Visitor Visa",
  qatar_tourist: "Qatar Tourist Visa",
  saudi_evisa: "Saudi Arabia Tourist eVisa",
  schengen: "Schengen Visa",
  singapore_visit: "Singapore Short-Term Visit Pass",
  south_africa_visitor: "South Africa Visitor Visa",
  thailand_tourist: "Thailand Tourist Visa",
  turkey_evisa: "Turkey e-Visa",
  uae_tourist: "UAE Tourist Visa",
  uk_visitor: "UK Standard Visitor Visa",
  us_b1b2: "US B1/B2 Visitor Visa",
  us_f1: "US F-1 Student Visa",
};

function getVisaTypesForCountry(countryCode) {
  const specific = COUNTRY_SPECIFIC_VISA_TYPES[countryCode] || [];
  // Merge: country-specific first, then generic ones not already covered
  const specificValues = new Set(specific.map(v => v.value));
  const generics = GENERIC_VISA_TYPES.filter(v => !specificValues.has(v.value));
  return [...specific, ...generics];
}

export default function VisaManager({ visas = [], onVisasChange, passportCountry }) {
  const [isOpen, setIsOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [newVisa, setNewVisa] = useState({
    country_code: '',
    country_name: '',
    visa_type: '',
    expiry_date: '',
  });

  const handleAddVisa = () => {
    if (newVisa.country_code && newVisa.visa_type) {
      onVisasChange([...visas, newVisa]);
      setNewVisa({
        country_code: '',
        country_name: '',
        visa_type: '',
        expiry_date: '',
      });
      setIsOpen(false);
    }
  };

  const handleRemoveVisa = (index) => {
    onVisasChange(visas.filter((_, i) => i !== index));
  };

  const isExpired = (date) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const isExpiringSoon = (date) => {
    if (!date) return false;
    const threeMonths = new Date();
    threeMonths.setMonth(threeMonths.getMonth() + 3);
    return new Date(date) < threeMonths && !isExpired(date);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-slate-600" />
          <h3 className="font-semibold text-slate-900">Your Visas</h3>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-sky-600 hover:bg-sky-700">
              <Plus className="w-4 h-4 mr-1" />
              Add Visa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add a Visa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Country</Label>
                <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between h-11"
                    >
                      {newVisa.country_code ? (
                        <span className="flex items-center gap-2">
                          <span>{getFlagEmoji(newVisa.country_code)}</span>
                          {newVisa.country_name}
                        </span>
                      ) : (
                        "Select country"
                      )}
                      <ChevronDown className="w-4 h-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search..." />
                      <CommandList>
                        <CommandEmpty>No country found.</CommandEmpty>
                        <CommandGroup className="max-h-[200px] overflow-auto">
                         {COUNTRIES.filter(c => c.code !== passportCountry).map((country) => (
                           <CommandItem
                             key={country.code}
                             value={country.name}
                             onSelect={() => {
                               setNewVisa({
                                 ...newVisa,
                                 country_code: country.code,
                                 country_name: country.name,
                                 visa_type: '',
                               });
                               setCountryOpen(false);
                             }}
                           >
                             <span className="mr-2">{getFlagEmoji(country.code)}</span>
                             {country.name}
                             {newVisa.country_code === country.code && (
                               <Check className="ml-auto w-4 h-4" />
                             )}
                           </CommandItem>
                         ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Visa Type</Label>
                <Select
                  value={newVisa.visa_type}
                  onValueChange={(value) => setNewVisa({ ...newVisa, visa_type: value })}
                  disabled={!newVisa.country_code}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={newVisa.country_code ? "Select visa type" : "Select a country first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {getVisaTypesForCountry(newVisa.country_code).map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Expiry Date (optional)</Label>
                <Input
                  type="date"
                  value={newVisa.expiry_date}
                  onChange={(e) => setNewVisa({ ...newVisa, expiry_date: e.target.value })}
                />
              </div>

              <Button 
                onClick={handleAddVisa} 
                className="w-full bg-sky-600 hover:bg-sky-700"
                disabled={!newVisa.country_code || !newVisa.visa_type}
              >
                Add Visa
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {visas.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <Shield className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">No visas added yet</p>
          <p className="text-slate-400 text-xs">Add visas to unlock more flight routes</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {visas.map((visa, index) => (
              <motion.div
                key={`${visa.country_code}-${index}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl border bg-white",
                  isExpired(visa.expiry_date) && "border-red-200 bg-red-50",
                  isExpiringSoon(visa.expiry_date) && !isExpired(visa.expiry_date) && "border-amber-200 bg-amber-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getFlagEmoji(visa.country_code)}</span>
                  <div>
                    <p className="font-medium text-slate-900">{visa.country_name}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500 capitalize">
                        {ALL_VISA_TYPE_LABELS[visa.visa_type] || visa.visa_type}
                      </span>
                      {visa.expiry_date && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className={cn(
                            "flex items-center gap-1",
                            isExpired(visa.expiry_date) ? "text-red-600" : 
                            isExpiringSoon(visa.expiry_date) ? "text-amber-600" : "text-slate-500"
                          )}>
                            <Calendar className="w-3 h-3" />
                            {isExpired(visa.expiry_date) ? "Expired" : `Exp: ${visa.expiry_date}`}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveVisa(index)}
                  className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}