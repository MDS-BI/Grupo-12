export const CONTACT_INFO = Object.freeze({
  title: 'Contáctanos',
  email: 'contacto@crm.demo',
  phone: '+56 2 1234 5678',
  address: 'Av. Providencia 1234, Santiago, Chile',
  hours: 'Lunes a viernes, 09:00–18:00'
});

const FIELD_KEYS = Object.freeze(['email', 'phone', 'address', 'hours']);

export function fillContactInfo(root) {
  if (!root) return root;

  const title = root.querySelector('.contact-info-title');
  if (title) title.textContent = CONTACT_INFO.title;

  for (const key of FIELD_KEYS) {
    const node = root.querySelector(`[data-contact-field="${key}"]`);
    if (node) node.textContent = CONTACT_INFO[key];
  }

  return root;
}
