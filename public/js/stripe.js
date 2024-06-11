/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';
const stripe = Stripe(
  'pk_test_51PPsWwAYngtuOGzQRfXa5h1NeHJODVPCUpvscNov1OuDg26LYNP1EcUMhRiVQxNt59jYrppVVMLdUMSiU7LmDjgA00UEYyTfSU',
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    //2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert('error', err);
  }
};
