# Tanışma Asistanı

İçerik üreticileriyle ilk tanışma görüşmesini yürüten, gerektiğinde insan yöneticiye devreden bir AI asistan prototipi.

> **Durum:** Mock UI aşaması. Görüşmeler şu an hazır senaryolardan oynatılıyor, LLM entegrasyonu henüz yok.

## Çalıştırma

```bash
pnpm install
pnpm dev
```

[http://localhost:3000](http://localhost:3000) adresini aç, bir senaryo seç ve "İleri" ile görüşmeyi adım adım oynat.

## Ekran

- **Chat:** Asistanla içerik üreticisi arasındaki görüşme.
- **Operatör paneli:** Sağdaki, açılıp kapanabilen sidebar. Konuşmanın aşamasını, bilgi tabanından hangi bilgilerin kullanıldığını (bulunamayanlar işaretli), tool çağrılarını, insana devirleri ve görüşme sonu özetini gösterir.

### Senaryolar

| Senaryo | Gösterdiği davranış |
|---|---|
| İlgili kişi | Üç örnek soru (yayın sıklığı, ücret, sonra görüşme) ve yönetici görüşmesi planlama |
| Şu an meşgul | Geri arama planlama |
| İlgilenmiyor | Sürecin kibarca kapatılması |
| Zor sorular | AI olduğunu açıklama, ücret garantisi talebini ve bilinmeyen sözleşme koşullarını insana devretme |

## Yapı

```
src/
├── app/                      Next.js App Router
├── components/
│   ├── chat/                 Header, mesaj listesi, composer
│   ├── operator/             Operatör paneli ve bölümleri
│   ├── scenario-bar.tsx
│   └── conversation-workspace.tsx
├── hooks/
│   └── use-scenario-player.ts
└── lib/
    ├── types.ts              Domain tipleri ve konuşma event'leri
    ├── knowledge.ts          Temsili çalışma koşulları (bilgi tabanı)
    ├── conversation-reducer.ts
    └── mock-scenarios.ts
```

Konuşma durumu event tabanlı bir reducer ile yönetiliyor (`message`, `stage`, `tool_call`, `knowledge`, `escalation`, `summary`). Mock senaryolar bugün bu event'leri üretiyor. İleride LLM stream'i de aynı event'leri üreteceği için UI değişmeden kalacak.

## Yol haritası

- [x] Mock UI ve senaryolar
- [ ] `/api/chat` route'u, system prompt ve tool calling ile LLM entegrasyonu
- [ ] Structured output ile görüşme sonu özeti
- [ ] Web Speech API ile sesli mod
- [ ] Deploy
