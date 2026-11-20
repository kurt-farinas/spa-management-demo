// PH mobile: 09 plus 9 digits; spaces anywhere are fine ('0917 123 4567')
const MOBILE = /^09\d{9}$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// returns { [field]: message } for each field that needs fixing; {} when the input is fine
export function validateClient({ name = '', phone = '', email = '' }) {
  const errors = {}
  if (!name.trim()) errors.name = 'Enter a name'
  if (!MOBILE.test(phone.replace(/ /g, ''))) errors.phone = 'Enter a mobile number like 0917 123 4567'
  if (email.trim() && !EMAIL.test(email.trim())) errors.email = 'Enter an email like name@example.com'
  return errors
}
