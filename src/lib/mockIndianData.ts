export interface ServiceProvider {
  id: string;
  name: string;
  phone: string;
  rating: number;
  reviewCount: number;
  address: string;
  imageUrl: string;
  openNow: boolean;
}

const indianFirstNames = [
  "Rajesh", "Amit", "Sunil", "Priya", "Deepak", "Anita", "Vikram", "Pooja",
  "Manoj", "Kavita", "Ravi", "Sunita", "Arun", "Meena", "Sanjay", "Neha",
  "Prakash", "Rekha", "Ashok", "Swati", "Mukesh", "Geeta", "Dinesh", "Asha",
  "Ramesh", "Seema", "Vijay", "Anjali", "Suresh", "Nisha", "Harish", "Komal",
];

const indianLastNames = [
  "Sharma", "Verma", "Gupta", "Singh", "Patel", "Kumar", "Joshi", "Mishra",
  "Yadav", "Chauhan", "Agarwal", "Reddy", "Nair", "Iyer", "Mehta", "Shah",
  "Das", "Bose", "Sen", "Pillai", "Rao", "Kulkarni", "Deshmukh", "Pandey",
];

const indianCities = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune",
  "Ahmedabad", "Jaipur", "Lucknow", "Chandigarh", "Indore", "Bhopal", "Noida",
  "Gurgaon", "Nagpur",
];

const areas: Record<string, string[]> = {
  Mumbai: ["Andheri West", "Bandra East", "Malad West", "Borivali", "Dadar", "Juhu", "Powai", "Thane"],
  Delhi: ["Connaught Place", "Karol Bagh", "Saket", "Dwarka", "Rohini", "Lajpat Nagar", "Pitampura", "Janakpuri"],
  Bangalore: ["Koramangala", "Indiranagar", "Whitefield", "HSR Layout", "JP Nagar", "BTM Layout", "Jayanagar", "Electronic City"],
  Hyderabad: ["Banjara Hills", "Madhapur", "Gachibowli", "Jubilee Hills", "Secunderabad", "Kukatpally", "Ameerpet", "Begumpet"],
  Chennai: ["T. Nagar", "Anna Nagar", "Velachery", "Adyar", "Mylapore", "Nungambakkam", "Guindy", "OMR"],
  Kolkata: ["Salt Lake", "Park Street", "Howrah", "Dum Dum", "New Town", "Ballygunge", "Jadavpur", "Gariahat"],
  Pune: ["Kothrud", "Viman Nagar", "Hinjewadi", "Shivaji Nagar", "Wakad", "Hadapsar", "Baner", "Aundh"],
  Ahmedabad: ["Navrangpura", "Satellite", "SG Highway", "Bodakdev", "Paldi", "Maninagar", "Vastrapur", "Bopal"],
  Jaipur: ["C-Scheme", "Malviya Nagar", "Vaishali Nagar", "Mansarovar", "Raja Park", "Tonk Road", "Sodala", "Ajmer Road"],
  Lucknow: ["Hazratganj", "Gomti Nagar", "Aliganj", "Aminabad", "Indira Nagar", "Alambagh", "Mahanagar", "Rajajipuram"],
  Chandigarh: ["Sector 17", "Sector 22", "Sector 35", "Sector 44", "Mohali", "Panchkula", "Zirakpur", "IT Park"],
  Indore: ["Vijay Nagar", "Palasia", "Sapna Sangeeta", "New Palasia", "MG Road", "Bhawarkua", "Rau", "AB Road"],
  Bhopal: ["MP Nagar", "Arera Colony", "New Market", "TT Nagar", "Kolar", "Hoshangabad Road", "Bairagarh", "Habibganj"],
  Noida: ["Sector 18", "Sector 62", "Sector 15", "Sector 50", "Greater Noida", "Sector 137", "Sector 76", "Film City"],
  Gurgaon: ["DLF Phase 1", "Sohna Road", "MG Road", "Golf Course Road", "Sector 14", "Sector 29", "Udyog Vihar", "Cyber City"],
  Nagpur: ["Dharampeth", "Sitabuldi", "Sadar", "Manish Nagar", "Civil Lines", "Ramdaspeth", "Laxmi Nagar", "Wardha Road"],
};

const serviceImageMap: Record<string, string[]> = {
  "Home Services": [
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop",
  ],
  "Vehicle Services": [
    "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=300&fit=crop",
  ],
  "Health Services": [
    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&h=300&fit=crop",
  ],
  "Spa & Wellness": [
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=400&h=300&fit=crop",
  ],
  "Appointments": [
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
  ],
  "Finance Services": [
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1553729459-afe8f2e2ed65?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=400&h=300&fit=crop",
  ],
  "Travel & Emergency": [
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
  ],
};

const defaultImages = [
  "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop",
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePhone(): string {
  const prefixes = ["98", "97", "96", "95", "94", "93", "91", "90", "88", "87", "86", "85", "70", "73", "74", "75", "76", "77", "78", "79"];
  const prefix = randomFrom(prefixes);
  const rest = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join("");
  return `+91 ${prefix}${rest.slice(0, 4)} ${rest.slice(4)}`;
}

function generateRating(): { rating: number; reviewCount: number } {
  const rating = Math.round((3 + Math.random() * 2) * 10) / 10; // 3.0 - 5.0
  const reviewCount = Math.floor(50 + Math.random() * 950); // 50-999
  return { rating, reviewCount };
}

export function generateProviders(serviceLabel: string, categoryTitle: string, count = 16): ServiceProvider[] {
  const city = randomFrom(indianCities);
  const cityAreas = areas[city] || areas.Mumbai;
  const images = serviceImageMap[categoryTitle] || defaultImages;

  const usedNames = new Set<string>();
  const providers: ServiceProvider[] = [];

  for (let i = 0; i < count; i++) {
    let name: string;
    do {
      const first = randomFrom(indianFirstNames);
      const last = randomFrom(indianLastNames);
      name = `${first} ${last} ${serviceLabel}`;
    } while (usedNames.has(name));
    usedNames.add(name);

    const area = randomFrom(cityAreas);
    const { rating, reviewCount } = generateRating();

    providers.push({
      id: `mock_${i}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name,
      phone: generatePhone(),
      rating,
      reviewCount,
      address: `${Math.floor(1 + Math.random() * 200)}, ${area}, ${city}`,
      imageUrl: images[i % images.length],
      openNow: Math.random() > 0.3,
    });
  }

  return providers;
}
