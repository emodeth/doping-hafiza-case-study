/**
 * Temsili çalışma koşulları. Asistan yalnızca buradaki bilgileri kullanabilir.
 *
 * Sözleşme süresi, münhasırlık, ekipman desteği, ödeme takvimi gibi konular
 * bilerek tanımsız bırakıldı: asistanın bilmediği bir konuda koşul uydurmadığını
 * ve konuyu insan yöneticiye devrettiğini göstermek için.
 */

export const ASSISTANT = {
  name: "Dopi",
  role: "Yapay zekâ asistanı",
  teamName: "Doping Hafıza",
  projectName: "Canlı Yayın Projesi",
} as const;

/** Temsili görüşme yapılan içerik üreticisi. */
export const CONTACT = {
  addressAs: "Emirhan Bey",
  expertise: "yazılım geliştirme",
} as const;

/**
 * Karşılama mesajı LLM'e üretilmez, sabittir: asistanın kendini yapay zekâ
 * olarak tanıtması ve uygunluk sorması böylece her görüşmede garanti altına alınır.
 */
export const GREETING = `Merhaba ${CONTACT.addressAs}, ben ${ASSISTANT.name}, ${ASSISTANT.teamName} ekibinin yapay zekâ asistanıyım. Yeni bir canlı yayın projesiyle ilgili kısa bir tanışma için ulaşıyorum. Şu an 5 dakikanız var mı?`;

export interface KnowledgeEntry {
  topic: string;
  title: string;
  content: string;
}

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    topic: "project",
    title: "Proje özeti",
    content:
      "İçerik üreticisi kendi uzmanlık alanında düzenli canlı yayınlar açar, izleyiciye öğretici veya uygulamalı içerik sunar. Yayınlardan seçilen kısa kesitler içerik üreticisinin profilinde paylaşılır.",
  },
  {
    topic: "streamFrequency",
    title: "Yayın sıklığı",
    content:
      "Haftada 2–3 yayın öneriliyor, her biri yaklaşık 45–60 dakika. Yayın takvimi içerik üreticisiyle birlikte belirlenir.",
  },
  {
    topic: "compensation",
    title: "Ücretlendirme",
    content:
      "Ücret; uzmanlık alanı, kitle büyüklüğü ve yayın sıklığına göre kişiye özel belirlenir. Kesin rakam yönetici görüşmesinde konuşulur. Asistan rakam veya garanti veremez.",
  },
  {
    topic: "clips",
    title: "Kısa kesitler",
    content:
      "Kesitler ekip tarafından hazırlanır ve paylaşılmadan önce içerik üreticisinin onayına sunulur.",
  },
  {
    topic: "contentTopics",
    title: "İçerik konuları",
    content:
      "Yayın konuları içerik üreticisinin uzmanlık alanına göre birlikte belirlenir. Ekip konu önerisi ve yayın akışı konusunda destek sağlar.",
  },
  {
    topic: "nextSteps",
    title: "Sonraki adımlar",
    content:
      "İlgilenen içerik üreticisi için bir yönetici görüşmesi planlanır. Detaylar, ücret ve sözleşme konuları bu görüşmede netleşir.",
  },
];

export function lookupKnowledge(topic: string): KnowledgeEntry | undefined {
  return KNOWLEDGE_BASE.find((entry) => entry.topic === topic);
}
