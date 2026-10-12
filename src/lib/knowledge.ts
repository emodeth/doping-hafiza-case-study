/**
 * Temsili çalışma koşulları. Asistan yalnızca buradaki bilgileri kullanabilir.
 *
 * Sözleşme süresi, münhasırlık, ekipman desteği, ödeme takvimi gibi konular
 * bilerek tanımsız bırakıldı: asistanın bilmediği bir konuda koşul uydurmadığını
 * ve konuyu insan yöneticiye devrettiğini göstermek için.
 */

export const ASSISTANT = {
  name: "Lumi",
  role: "Yapay zekâ asistanı",
  projectName: "Canlı Yayın Projesi",
} as const;

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
