// Book cover images
import harrisonInternal from './harrison-internal.jpg';
import braunwaldCardiology from './braunwald-cardiology.jpg';
import fishmanPulmonary from './fishman-pulmonary.jpg';
import goldfrank from './goldfrank-toxicology.jpg';
import williamsEndocrinology from './williams-endocrinology.jpg';
import brennerNephrology from './brenner-nephrology.jpg';
import tintinalliEmergency from './tintinalli-emergency.jpg';
import morganAnesthesia from './morgan-anesthesia.jpg';
import sabistonSurgery from './sabiston-surgery.jpg';
import periopNursing from './periop-nursing.jpg';
import acsmGuidelines from './acsm-guidelines.jpg';

export const bookCovers: Record<string, string> = {
  'harrison-internal': harrisonInternal,
  'braunwald-cardiology': braunwaldCardiology,
  'fishman-pulmonary': fishmanPulmonary,
  'goldfrank-toxicology': goldfrank,
  'williams-endocrinology': williamsEndocrinology,
  'brenner-nephrology': brennerNephrology,
  'tintinalli-emergency': tintinalliEmergency,
  'morgan-anesthesia': morganAnesthesia,
  'sabiston-surgery': sabistonSurgery,
  'periop-nursing': periopNursing,
  'acsm-guidelines': acsmGuidelines,
};

export const getBookCover = (bookId: string): string | undefined => {
  return bookCovers[bookId];
};
