export interface Scenario {
  number: number;
  level: string;
  title: string;
  scenario: string;
}

export const scenarios: Scenario[] = [
  {
    number: 1,
    level: "A1 Başlangıç",
    title: "Tanışma: Hello!",
    scenario: "Bir partidesiniz. Yapay zeka ile kendinizi tanıtarak tanışın ve adını sorun."
  },
  {
    number: 2,
    level: "A1 Başlangıç",
    title: "Nasılsın?",
    scenario: "Bir arkadaşınızla (YZ) karşılaştınız. Ona nasıl olduğunu sorun ve kendi durumunuzdan bahsedin."
  },
  {
    number: 3,
    level: "A1 Başlangıç",
    title: "Neredensin?",
    scenario: "Yeni tanıştığınız birine (YZ) hangi ülkeden/şehirden olduğunu sorun."
  },
  {
    number: 4,
    level: "A1 Başlangıç",
    title: "Meslekler",
    scenario: "Karşınızdaki kişiye (YZ) ne iş yaptığını sorun ve kendi mesleğinizi söyleyin."
  },
  {
    number: 5,
    level: "A1 Başlangıç",
    title: "Aile Hakkında Konuşmak",
    scenario: "Yapay zekaya ailenizdeki kişilerin isimlerini ve kim olduklarını (kardeş, anne vb.) anlatın."
  },
  {
    number: 6,
    level: "A1 Başlangıç",
    title: "Yaş Sorma ve Söyleme",
    scenario: "Karşınızdaki kişiye (YZ) kaç yaşında olduğunu sorun ve kendi yaşınızı söyleyin."
  },
  {
    number: 7,
    level: "A1 Başlangıç",
    title: "Saat Kaç?",
    scenario: "Sokakta birine (YZ) saati sorun ve teşekkür edin."
  },
  {
    number: 8,
    level: "A1 Başlangıç",
    title: "Kafede Sipariş: İçecek",
    scenario: "Bir kafedesiniz. Baristadan (YZ) bir kahve veya çay sipariş edin."
  },
  {
    number: 9,
    level: "A1 Başlangıç",
    title: "Basit Yön Sorma",
    scenario: "Sokakta kayboldunuz. Bir yabancıya (YZ) tuvaletin veya metro durağının nerede olduğunu sorun."
  },
  {
    number: 10,
    level: "A1 Başlangıç",
    title: "Fiyat Sorma: Ne Kadar?",
    scenario: "Bir mağazadasınız. Satıcıya (YZ) beğendiğiniz bir tişörtün fiyatını sorun."
  },
  {
    number: 11,
    level: "A1 Başlangıç",
    title: "Renkler ve Kıyafetler",
    scenario: "Satıcıdan (YZ) denediğiniz kıyafetin farklı bir rengini (örneğin mavi) isteyin."
  },
  {
    number: 12,
    level: "A1 Başlangıç",
    title: "Hava Durumu",
    scenario: "Bir iş arkadaşınızla (YZ) bugünkü havanın nasıl olduğu hakkında kısa bir sohbet edin."
  },
  {
    number: 13,
    level: "A1 Başlangıç",
    title: "Hobiler: Ne Seversin?",
    scenario: "Yeni bir arkadaşınıza (YZ) boş zamanlarında ne yapmaktan hoşlandığını sorun."
  },
  {
    number: 14,
    level: "A1 Başlangıç",
    title: "Evcil Hayvanlar",
    scenario: "Yapay zekaya evcil hayvanınız olup olmadığını söyleyin ve onunkini sorun."
  },
  {
    number: 15,
    level: "A1 Başlangıç",
    title: "Restoranda Sipariş",
    scenario: "Garsona (YZ) menüden basit bir yemek (hamburger, pizza vb.) siparişi verin."
  },
  {
    number: 16,
    level: "A1 Başlangıç",
    title: "Günler ve Planlar",
    scenario: "Arkadaşınıza (YZ) hafta sonu, örneğin Cumartesi günü, boş olup olmadığını sorun."
  },
  {
    number: 17,
    level: "A1 Başlangıç",
    title: "Bilet Alma",
    scenario: "Gişe görevlisinden (YZ) tek yön bir otobüs veya tren bileti satın alın."
  },
  {
    number: 18,
    level: "A1 Başlangıç",
    title: "Duygular ve Durumlar",
    scenario: "Arkadaşınıza (YZ) bugün çok yorgun veya çok mutlu olduğunuzu söyleyin ve nedenini kısaca belirtin."
  },
  {
    number: 19,
    level: "A1 Başlangıç",
    title: "İletişim Bilgileri",
    scenario: "Yeni tanıştığınız birinden (YZ) telefon numarasını veya e-posta adresini isteyin."
  },
  {
    number: 20,
    level: "A1 Başlangıç",
    title: "Vedalaşma: Görüşürüz!",
    scenario: "Bir partiden ayrılıyorsunuz. Arkadaşınızla (YZ) vedalaşın ve iyi akşamlar dileyin."
  },
  {
    number: 21,
    level: "A2 Temel",
    title: "Süpermarkette Ürün Bulma",
    scenario: "Büyük bir markettesiniz. Görevliye (YZ) süt ve yumurta reyonunun nerede olduğunu sorun."
  },
  {
    number: 22,
    level: "A2 Temel",
    title: "Eczanede",
    scenario: "Başınız çok ağrıyor. Eczacıdan (YZ) ağrı kesici isteyin ve günde kaç tane içmeniz gerektiğini sorun."
  },
  {
    number: 23,
    level: "A2 Temel",
    title: "Doktorda: Şikayetler",
    scenario: "Doktordasınız (YZ). Kendinizi iyi hissetmediğinizi, ateşiniz olduğunu ve boğazınızın ağrıdığını anlatın."
  },
  {
    number: 24,
    level: "A2 Temel",
    title: "Kıyafet Deneme ve Beden",
    scenario: "Mağazadasınız. Satıcıya (YZ) denediğiniz pantolonun dar geldiğini söyleyip bir beden büyüğünü isteyin."
  },
  {
    number: 25,
    level: "A2 Temel",
    title: "Ürün İadesi",
    scenario: "Dün aldığınız gömleği iade etmek istiyorsunuz. Kasiyere (YZ) durumu ve iade nedeninizi açıklayın."
  },
  {
    number: 26,
    level: "A2 Temel",
    title: "Detaylı Yol Tarifi",
    scenario: "Bir turistsiniz. Yerli birine (YZ) en yakın müzeye nasıl gideceğinizi ve yürüyerek ne kadar süreceğini sorun."
  },
  {
    number: 27,
    level: "A2 Temel",
    title: "Geçmiş Hafta Sonu",
    scenario: "İş arkadaşınızla (YZ) hafta sonu neler yaptığınızı (nereye gittiniz, ne yediniz vb.) geçmiş zaman kullanarak konuşun."
  },
  {
    number: 28,
    level: "A2 Temel",
    title: "Otel Rezervasyonu",
    scenario: "Bir oteli aradınız. Resepsiyonistten (YZ) önümüzdeki hafta sonu için iki kişilik bir oda ayırtın."
  },
  {
    number: 29,
    level: "A2 Temel",
    title: "Otele Giriş (Check-in)",
    scenario: "Otele vardınız. Resepsiyoniste (YZ) rezervasyonunuz olduğunu söyleyip pasaportunuzu vererek giriş işlemlerini yapın."
  },
  {
    number: 30,
    level: "A2 Temel",
    title: "Otel Odası Sorunu",
    scenario: "Odanızın kliması çalışmıyor. Resepsiyonu (YZ) arayıp problemi bildirin ve tamirci isteyin."
  },
  {
    number: 31,
    level: "A2 Temel",
    title: "Araç Kiralama",
    scenario: "Araç kiralama ofisinde görevliden (YZ) 3 günlük, otomatik vites ekonomik bir araç kiralamak istediğinizi belirtin."
  },
  {
    number: 32,
    level: "A2 Temel",
    title: "Gelecek Planları: Tatil",
    scenario: "Arkadaşınızla (YZ) yaz tatilinde nereye gideceğinizi ve orada neler yapmayı planladığınızı konuşun."
  },
  {
    number: 33,
    level: "A2 Temel",
    title: "Postanede Kargo Gönderme",
    scenario: "Postane görevlisine (YZ) yurt dışına bir paket göndermek istediğinizi söyleyin ve ne kadar tutacağını sorun."
  },
  {
    number: 34,
    level: "A2 Temel",
    title: "Bankada İşlem",
    scenario: "Banka gişe görevlisine (YZ) Euro'yu yerel para birimine çevirmek veya yeni bir hesap açmak istediğinizi belirtin."
  },
  {
    number: 35,
    level: "A2 Temel",
    title: "Telefonda Mesaj Bırakma",
    scenario: "Birini aradınız ama ofiste yok. Sekretere (YZ) adınızı verip o kişiye sizi geri aramasını söylemesini rica edin."
  },
  {
    number: 36,
    level: "A2 Temel",
    title: "Günlük Rutinler",
    scenario: "Yeni ev arkadaşınızla (YZ) sabahları saat kaçta kalktığınızı, ne zaman işe/okula gittiğinizi konuşun."
  },
  {
    number: 37,
    level: "A2 Temel",
    title: "Arkadaşı Davet Etmek",
    scenario: "Arkadaşınızı (YZ) cuma akşamı yeni vizyona giren bir sinema filmine veya yemeğe davet edin."
  },
  {
    number: 38,
    level: "A2 Temel",
    title: "Geç Kalma ve Özür Dileme",
    scenario: "Bir buluşmaya geç kaldınız. Arkadaşınızdan (YZ) özür dileyip geç kalma nedeninizi (örneğin trafik) açıklayın."
  },
  {
    number: 39,
    level: "A2 Temel",
    title: "Film veya Kitap Anlatma",
    scenario: "Arkadaşınıza (YZ) en son izlediğiniz filmin veya okuduğunuz kitabın konusunu basitçe anlatın ve tavsiye edin."
  },
  {
    number: 40,
    level: "A2 Temel",
    title: "Birini Tarif Etme",
    scenario: "Arkadaşınıza (YZ) yeni tanıştığınız birinin dış görünüşünü (boy, saç rengi) ve karakterini (komik, utangaç vb.) tarif edin."
  }
];
