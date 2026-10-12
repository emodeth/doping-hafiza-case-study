import { ASSISTANT } from "./knowledge";
import type { ConversationEvent } from "./types";

/**
 * Mock UI için hazır görüşme senaryoları.
 * Her adım, "İleri"ye bir kez basıldığında uygulanan event listesidir.
 * Gerçek LLM entegrasyonu gelene kadar akışı ve paneli göstermek için kullanılır.
 */

export interface Scenario {
  id: string;
  label: string;
  description: string;
  steps: ConversationEvent[][];
}

const assistant = (content: string): ConversationEvent => ({
  type: "message",
  role: "assistant",
  content,
});

const user = (content: string): ConversationEvent => ({
  type: "message",
  role: "user",
  content,
});

const greeting: ConversationEvent[] = [
  { type: "stage", stage: "greeting" },
  assistant(
    `Merhaba Selin Hanım, ben ${ASSISTANT.name}, ekibin yapay zekâ asistanıyım. Yeni bir canlı yayın projesiyle ilgili kısa bir tanışma için ulaşıyorum. Şu an 5 dakikanız var mı?`,
  ),
];

const pitch: ConversationEvent[] = [
  { type: "stage", stage: "pitch" },
  { type: "tool_call", name: "lookup_info", args: { topic: "project" }, result: "found" },
  { type: "knowledge", topic: "project", found: true },
  assistant(
    "Harika, teşekkürler. Kısaca anlatayım: kendi uzmanlık alanınızda düzenli canlı yayınlar açıyorsunuz ve izleyiciye gerçekten faydalı içerik sunuyorsunuz. Yayınlardan seçtiğimiz kısa kesitler de profilinizde paylaşılıyor.",
  ),
];

export const SCENARIOS: Scenario[] = [
  {
    id: "interested",
    label: "İlgili kişi",
    description: "Üç örnek soruyu soruyor ve yönetici görüşmesi planlanıyor",
    steps: [
      greeting,
      [{ type: "stage", stage: "availability" }, user("Evet, müsaitim.")],
      pitch,
      [user("Haftada kaç yayın bekliyorsunuz?")],
      [
        { type: "stage", stage: "qa" },
        { type: "tool_call", name: "lookup_info", args: { topic: "streamFrequency" }, result: "found" },
        { type: "knowledge", topic: "streamFrequency", found: true },
        assistant(
          "Şu an haftada 2–3 yayın öneriyoruz, her biri yaklaşık 45–60 dakika. Takvimi sizinle birlikte belirliyoruz, size uymayan bir tempo dayatılmıyor.",
        ),
      ],
      [user("Ücret nasıl belirlenecek?")],
      [
        { type: "tool_call", name: "lookup_info", args: { topic: "compensation" }, result: "found" },
        { type: "knowledge", topic: "compensation", found: true },
        assistant(
          "Ücret alanınıza, kitlenize ve yayın sıklığına göre kişiye özel belirleniyor. Kesin rakamı benim söylemem doğru olmaz, bunu yöneticimiz sizinle görüşmede netleştirir.",
        ),
      ],
      [user("Tamam, daha sonra bir yöneticiyle konuşabilir miyiz?")],
      [
        { type: "stage", stage: "scheduling" },
        {
          type: "tool_call",
          name: "propose_callback",
          args: { slots: ["Perşembe 14:00", "Cuma 11:00"] },
        },
        assistant(
          "Memnuniyetle. Perşembe 14:00 veya Cuma 11:00 size uyar mı? Seçtiğiniz saati yöneticimize iletiyorum.",
        ),
      ],
      [user("Perşembe 14:00 olur.")],
      [
        { type: "stage", stage: "closed" },
        { type: "tool_call", name: "end_conversation", args: { outcome: "interested" } },
        assistant(
          "Not aldım, Perşembe 14:00. Yöneticimiz o saatte size ulaşacak. Vakit ayırdığınız için çok teşekkürler Selin Hanım!",
        ),
        {
          type: "summary",
          summary: {
            interest: "interested",
            questionsAsked: [
              "Haftada kaç yayın bekliyorsunuz?",
              "Ücret nasıl belirlenecek?",
              "Daha sonra bir yöneticiyle konuşabilir miyiz?",
            ],
            nextStep: "Yönetici görüşmesi",
            callbackTime: "Perşembe 14:00",
            needsHuman: true,
            humanReasons: ["Ücret detayı yönetici görüşmesinde netleşecek"],
            notes: "Proje fikrine olumlu yaklaştı, tempo konusunda esneklik önemli.",
          },
        },
      ],
    ],
  },
  {
    id: "busy",
    label: "Şu an meşgul",
    description: "Uygun değil, daha sonra aranmak istiyor",
    steps: [
      greeting,
      [
        { type: "stage", stage: "availability" },
        user("Şu an toplantıdayım, daha sonra konuşabilir miyiz?"),
      ],
      [
        { type: "stage", stage: "scheduling" },
        {
          type: "tool_call",
          name: "propose_callback",
          args: { slots: ["Yarın 10:00", "Yarın 16:00"] },
        },
        assistant(
          "Tabii, hiç sorun değil. Size uygun bir saatte tekrar ulaşalım. Yarın 10:00 veya 16:00 nasıl olur?",
        ),
      ],
      [user("16:00 olur.")],
      [
        { type: "stage", stage: "closed" },
        { type: "tool_call", name: "end_conversation", args: { outcome: "callback" } },
        assistant("Not aldım, yarın 16:00'da görüşmek üzere. İyi toplantılar!"),
        {
          type: "summary",
          summary: {
            interest: "callback",
            questionsAsked: ["Daha sonra konuşabilir miyiz?"],
            nextStep: "Tekrar arama",
            callbackTime: "Yarın 16:00",
            needsHuman: false,
            humanReasons: [],
            notes: "Proje henüz anlatılmadı, geri aramada baştan anlatılmalı.",
          },
        },
      ],
    ],
  },
  {
    id: "not-interested",
    label: "İlgilenmiyor",
    description: "Görüşmek istemiyor, süreç kapatılıyor",
    steps: [
      greeting,
      [
        { type: "stage", stage: "availability" },
        user("Açıkçası ilgilenmiyorum, teşekkürler."),
      ],
      [
        { type: "stage", stage: "closed" },
        { type: "tool_call", name: "end_conversation", args: { outcome: "not_interested" } },
        assistant(
          "Anlıyorum, açık sözlülüğünüz için teşekkürler. Sizi tekrar rahatsız etmeyeceğiz. İyi günler dilerim!",
        ),
        {
          type: "summary",
          summary: {
            interest: "not_interested",
            questionsAsked: [],
            nextStep: "Süreç kapatıldı, tekrar ulaşılmayacak",
            needsHuman: false,
            humanReasons: [],
            notes: "Görüşmeyi kibarca reddetti.",
          },
        },
      ],
    ],
  },
  {
    id: "edge-cases",
    label: "Zor sorular",
    description: "Bilgi sınırları ve insana devir davranışı",
    steps: [
      greeting,
      [{ type: "stage", stage: "availability" }, user("Evet, dinliyorum.")],
      pitch,
      [user("Bir saniye, sen gerçek bir insan mısın?")],
      [
        { type: "stage", stage: "qa" },
        assistant(
          "Hayır, ben bir yapay zekâ asistanıyım. İsterseniz sizi istediğiniz an ekibimizden bir yöneticiye yönlendirebilirim.",
        ),
      ],
      [user("Yayın başı en az 20 bin TL garanti verebilir misiniz?")],
      [
        { type: "tool_call", name: "lookup_info", args: { topic: "compensation" }, result: "found" },
        { type: "knowledge", topic: "compensation", found: true },
        {
          type: "tool_call",
          name: "escalate_to_human",
          args: { reason: "Ücret garantisi talebi", urgency: "medium" },
        },
        { type: "escalation", reason: "Yayın başı 20 bin TL garanti talebi", urgency: "medium" },
        assistant(
          "Bu konuda söz vermek benim yetkimde değil. Talebinizi olduğu gibi not alıp yöneticimize iletiyorum, size kendisi dönüş yapacak.",
        ),
      ],
      [user("Sözleşme kaç yıllık, münhasırlık var mı?")],
      [
        { type: "tool_call", name: "lookup_info", args: { topic: "contract" }, result: "not_found" },
        { type: "knowledge", topic: "contract", found: false },
        {
          type: "tool_call",
          name: "escalate_to_human",
          args: { reason: "Sözleşme ve münhasırlık sorusu", urgency: "low" },
        },
        { type: "escalation", reason: "Sözleşme süresi ve münhasırlık sorusu", urgency: "low" },
        assistant(
          "Bu bilgi elimde yok, tahminle bir şey söylemek istemem. Bu sorunuzu da yöneticimize iletiyorum. Sizi bu hafta araması için Çarşamba 15:00 uygun olur mu?",
        ),
      ],
      [user("Olur, uygun.")],
      [
        { type: "stage", stage: "scheduling" },
        {
          type: "tool_call",
          name: "propose_callback",
          args: { slots: ["Çarşamba 15:00"] },
          result: "accepted",
        },
        { type: "stage", stage: "closed" },
        { type: "tool_call", name: "end_conversation", args: { outcome: "maybe" } },
        assistant(
          "Harika, Çarşamba 15:00. Tüm sorularınızı yöneticimize ilettim. Vakit ayırdığınız için teşekkürler!",
        ),
        {
          type: "summary",
          summary: {
            interest: "maybe",
            questionsAsked: [
              "Sen gerçek bir insan mısın?",
              "Yayın başı 20 bin TL garanti verebilir misiniz?",
              "Sözleşme kaç yıllık, münhasırlık var mı?",
            ],
            nextStep: "Yönetici görüşmesi",
            callbackTime: "Çarşamba 15:00",
            needsHuman: true,
            humanReasons: [
              "Ücret garantisi talebi (20 bin TL / yayın)",
              "Sözleşme süresi ve münhasırlık bilgisi bilgi tabanında yok",
            ],
            notes: "İlgili ama ücret konusunda net beklentisi var, görüşmeye hazırlıklı girilmeli.",
          },
        },
      ],
    ],
  },
];
