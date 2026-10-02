const chapters = [
  {
    number: 1,
    title: "अर्जुन विषाद योग",
    englishTitle: "Arjuna Vishada Yoga",
    description:
      "कुरुक्षेत्र के युद्धक्षेत्र में अर्जुन अपने संबंधियों और गुरुजनों को देखकर मोह और विषाद से भर जाते हैं।",
    verseCount: 47,
  },
  {
    number: 2,
    title: "सांख्य योग",
    englishTitle: "Sankhya Yoga",
    description:
      "श्रीकृष्ण अर्जुन को आत्मा, कर्म, ज्ञान और समत्व का ज्ञान देते हैं।",
    verseCount: 72,
  },
  {
    number: 3,
    title: "कर्म योग",
    englishTitle: "Karma Yoga",
    description:
      "श्रीकृष्ण निष्काम कर्म और अपने कर्तव्य का पालन करने का मार्ग बताते हैं।",
    verseCount: 43,
  },
  {
    number: 4,
    title: "ज्ञान कर्म संन्यास योग",
    englishTitle: "Jnana Karma Sannyasa Yoga",
    description:
      "भगवान श्रीकृष्ण दिव्य ज्ञान, कर्म और धर्म की स्थापना के अपने अवतार के रहस्य बताते हैं।",
    verseCount: 42,
  },
  {
    number: 5,
    title: "कर्म संन्यास योग",
    englishTitle: "Karma Sannyasa Yoga",
    description:
      "कर्म संन्यास और निष्काम कर्म के बीच संबंध तथा मुक्ति का मार्ग समझाया गया है।",
    verseCount: 29,
  },
  {
    number: 6,
    title: "ध्यान योग",
    englishTitle: "Dhyana Yoga",
    description:
      "मन को नियंत्रित करने, ध्यान करने और आत्म-साक्षात्कार प्राप्त करने का मार्ग बताया गया है।",
    verseCount: 47,
  },
  {
    number: 7,
    title: "ज्ञान विज्ञान योग",
    englishTitle: "Jnana Vijnana Yoga",
    description:
      "भगवान श्रीकृष्ण अपने स्वरूप, प्रकृति और अपनी दिव्य शक्ति का ज्ञान देते हैं।",
    verseCount: 30,
  },
  {
    number: 8,
    title: "अक्षर ब्रह्म योग",
    englishTitle: "Akshara Brahma Yoga",
    description:
      "ब्रह्म, अध्यात्म, कर्म और मृत्यु के समय भगवान के स्मरण का महत्व समझाया गया है।",
    verseCount: 28,
  },
  {
    number: 9,
    title: "राजविद्या राजगुह्य योग",
    englishTitle: "Raja Vidya Raja Guhya Yoga",
    description:
      "भगवान की सर्वोच्च सत्ता और भक्ति के गूढ़ एवं दिव्य ज्ञान का वर्णन किया गया है।",
    verseCount: 34,
  },
  {
    number: 10,
    title: "विभूति योग",
    englishTitle: "Vibhuti Yoga",
    description:
      "श्रीकृष्ण अपनी दिव्य विभूतियों और संसार में अपनी उपस्थिति के विभिन्न रूप बताते हैं।",
    verseCount: 42,
  },
  {
    number: 11,
    title: "विश्वरूप दर्शन योग",
    englishTitle: "Vishvarupa Darshana Yoga",
    description:
      "अर्जुन को भगवान श्रीकृष्ण का विराट और दिव्य विश्वरूप देखने का अवसर मिलता है।",
    verseCount: 55,
  },
  {
    number: 12,
    title: "भक्ति योग",
    englishTitle: "Bhakti Yoga",
    description:
      "भगवान की भक्ति, भक्त के गुण और परमात्मा की प्राप्ति के सरल मार्ग का वर्णन है।",
    verseCount: 20,
  },
  {
    number: 13,
    title: "क्षेत्र क्षेत्रज्ञ विभाग योग",
    englishTitle: "Kshetra Kshetrajna Vibhaga Yoga",
    description:
      "शरीर, आत्मा और क्षेत्रज्ञ के स्वरूप तथा प्रकृति और पुरुष के भेद को समझाया गया है।",
    verseCount: 35,
  },
  {
    number: 14,
    title: "गुणत्रय विभाग योग",
    englishTitle: "Gunatraya Vibhaga Yoga",
    description:
      "सत्व, रज और तम इन तीन गुणों तथा उनके मनुष्य के जीवन पर प्रभाव का वर्णन किया गया है।",
    verseCount: 27,
  },
  {
    number: 15,
    title: "पुरुषोत्तम योग",
    englishTitle: "Purushottama Yoga",
    description:
      "संसार रूपी वृक्ष, जीवात्मा और परम पुरुषोत्तम भगवान के स्वरूप का वर्णन किया गया है।",
    verseCount: 20,
  },
  {
    number: 16,
    title: "दैवासुर सम्पद विभाग योग",
    englishTitle: "Daivasura Sampad Vibhaga Yoga",
    description:
      "दैवी और आसुरी गुणों तथा उनके जीवन और आध्यात्मिक विकास पर प्रभाव का वर्णन है।",
    verseCount: 24,
  },
  {
    number: 17,
    title: "श्रद्धात्रय विभाग योग",
    englishTitle: "Shraddhatraya Vibhaga Yoga",
    description:
      "सात्त्विक, राजसिक और तामसिक श्रद्धा तथा भोजन, यज्ञ, तप और दान के तीन प्रकार समझाए गए हैं।",
    verseCount: 28,
  },
  {
    number: 18,
    title: "मोक्ष संन्यास योग",
    englishTitle: "Moksha Sannyasa Yoga",
    description:
      "भगवद्गीता का अंतिम अध्याय त्याग, कर्म, ज्ञान, भक्ति और मोक्ष के अंतिम सिद्धांतों को समाहित करता है।",
    verseCount: 78,
  },
];

export default chapters;
