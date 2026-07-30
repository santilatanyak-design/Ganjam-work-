import { WorkerProfile, Language } from '../types';

/**
 * Dynamically updates Open Graph (OG) and Twitter meta tags in <head>
 * so social media crawlers & previews render rich card preview with worker image, name, profession, and location.
 */
export const updateOgMetaTags = (worker: WorkerProfile, language: Language = 'en') => {
  const name = language === 'or' ? worker.nameOr : worker.nameEn;
  const profession = language === 'or' ? worker.skillTitleOr : worker.skillTitleEn;
  const location = language === 'or' ? worker.locationOr : worker.locationEn;
  
  const title = `${name} - ${profession} in ${location} | Ganjam Express`;
  const description = `🛠️ ${name} (${profession}) located in ${location}, Ganjam. Contact & book daily/hourly skilled services on Ganjam Express platform.`;
  const shareUrl = getWorkerShareUrl(worker.id);
  const imageUrl = worker.photoUrl;

  // Update Page Title
  document.title = title;

  // Helper to create or update meta tag
  const setMetaTag = (selector: string, attribute: string, keyName: string, content: string) => {
    let element = document.querySelector(`meta[${attribute}="${keyName}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attribute, keyName);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  // Open Graph (Facebook / WhatsApp / LinkedIn / Telegram)
  setMetaTag('meta', 'property', 'og:title', title);
  setMetaTag('meta', 'property', 'og:description', description);
  setMetaTag('meta', 'property', 'og:image', imageUrl);
  setMetaTag('meta', 'property', 'og:url', shareUrl);
  setMetaTag('meta', 'property', 'og:type', 'profile');

  // Twitter Card
  setMetaTag('meta', 'name', 'twitter:card', 'summary_large_image');
  setMetaTag('meta', 'name', 'twitter:title', title);
  setMetaTag('meta', 'name', 'twitter:description', description);
  setMetaTag('meta', 'name', 'twitter:image', imageUrl);
};

/**
 * Returns clean shareable URL for worker profile
 */
export const getWorkerShareUrl = (workerId: string): string => {
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?worker=${encodeURIComponent(workerId)}`;
};

/**
 * Formats rich text summary containing Photo URL, Name, Profession, and Address/Location
 */
export const getWorkerShareDetails = (worker: WorkerProfile, language: Language = 'en') => {
  const name = language === 'or' ? worker.nameOr : worker.nameEn;
  const profession = language === 'or' ? worker.skillTitleOr : worker.skillTitleEn;
  const location = language === 'or' ? worker.locationOr : worker.locationEn;
  const shareUrl = getWorkerShareUrl(worker.id);

  const textSummary = language === 'or'
    ? `👷‍♂️ *ଶ୍ରମିକ ପ୍ରୋଫାଇଲ୍: ${name}*\n🛠️ *ପ୍ରଫେସନ୍:* ${profession}\n📍 *ଠିକଣା/ଲୋକେସନ୍:* ${location}, ଗଞ୍ଜାମ, ଓଡ଼ିଶା\n⭐ *ରେଟିଂ:* ${worker.rating}/5 (${worker.reviewCount} ମତାମତ)\n💰 *ଦୈନିକ ଦର:* ₹${worker.dailyRate}/ଦିନ\n\n🖼️ *ଫୋଟୋ:* ${worker.photoUrl}\n🔗 *ପ୍ରୋଫାଇଲ୍ ଲିଙ୍କ୍:* ${shareUrl}`
    : `👷‍♂️ *Worker Profile: ${name}*\n🛠️ *Profession:* ${profession}\n📍 *Address / Location:* ${location}, Ganjam, Odisha\n⭐ *Rating:* ${worker.rating}/5 (${worker.reviewCount} reviews)\n💰 *Daily Rate:* ₹${worker.dailyRate}/day\n\n🖼️ *Profile Photo:* ${worker.photoUrl}\n🔗 *Book & View Profile:* ${shareUrl}`;

  return {
    title: `${name} - ${profession}`,
    text: textSummary,
    url: shareUrl,
    name,
    profession,
    location,
    photoUrl: worker.photoUrl
  };
};

/**
 * Trigger Web Share API or return fallback status
 */
export const triggerWebShare = async (worker: WorkerProfile, language: Language = 'en'): Promise<boolean> => {
  updateOgMetaTags(worker, language);
  const details = getWorkerShareDetails(worker, language);

  if (navigator.share) {
    try {
      await navigator.share({
        title: details.title,
        text: details.text,
        url: details.url,
      });
      return true;
    } catch (err) {
      // User cancelled or share failed, fallback to custom modal
      return false;
    }
  }
  return false;
};
