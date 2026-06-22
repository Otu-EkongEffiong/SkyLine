/**
 * re-export the same function names from the new client so existing imporst such as:
 * 
 */

export {
    searchAirports,
    searchFlights,
    getCheapestDates,
    getFlightStatus,
    getLiveAircraftPosition,
    priceOffer,
    createBooking,
    checkVisaRequirements,
    createPaymentIntent,
  } from './flightClient';
   