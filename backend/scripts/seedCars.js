import pool from '../src/config/db.js';

const CARS_DATA = [
  // SEDANS & HATCHBACKS
  { model: 'Maruti Alto K10', type: 'Sedan', price: 1200 },
  { model: 'Renault Kwid', type: 'Sedan', price: 1300 },
  { model: 'Maruti S-Presso', type: 'Sedan', price: 1300 },
  { model: 'Tata Tiago', type: 'Sedan', price: 1400 },
  { model: 'Maruti WagonR', type: 'Sedan', price: 1400 },
  { model: 'Hyundai Grand i10 Nios', type: 'Sedan', price: 1500 },
  { model: 'Maruti Swift', type: 'Sedan', price: 1600 },
  { model: 'Tata Altroz', type: 'Sedan', price: 1700 },
  { model: 'Maruti Baleno', type: 'Sedan', price: 1700 },
  { model: 'Hyundai i20', type: 'Sedan', price: 1800 },
  { model: 'Maruti Dzire', type: 'Sedan', price: 1800 },
  { model: 'Honda Amaze', type: 'Sedan', price: 1800 },
  { model: 'Tata Tigor', type: 'Sedan', price: 1700 },
  { model: 'Hyundai Aura', type: 'Sedan', price: 1750 },
  { model: 'Maruti Celerio', type: 'Sedan', price: 1400 },
  { model: 'Citroen C3', type: 'Sedan', price: 1500 },
  { model: 'Honda City', type: 'Sedan', price: 3000 },
  { model: 'Skoda Slavia', type: 'Sedan', price: 3200 },
  { model: 'Volkswagen Virtus', type: 'Sedan', price: 3300 },
  { model: 'Hyundai Verna', type: 'Sedan', price: 3100 },
  { model: 'BMW 3 Series', type: 'Sedan', price: 12000 },
  { model: 'Mercedes-Benz C-Class', type: 'Sedan', price: 13000 },
  { model: 'Mercedes-Benz E-Class', type: 'Sedan', price: 18000 },
  { model: 'Audi A4', type: 'Sedan', price: 12500 },
  { model: 'Jaguar XF', type: 'Sedan', price: 14000 },
  { model: 'Lexus ES', type: 'Sedan', price: 15000 },

  // SUVS
  { model: 'Tata Punch', type: 'SUV', price: 1800 },
  { model: 'Nissan Magnite', type: 'SUV', price: 1800 },
  { model: 'Renault Kiger', type: 'SUV', price: 1800 },
  { model: 'Hyundai Creta', type: 'SUV', price: 3500 },
  { model: 'Kia Seltos', type: 'SUV', price: 3500 },
  { model: 'Maruti Brezza', type: 'SUV', price: 2500 },
  { model: 'Toyota Urban Cruiser Hyryder', type: 'SUV', price: 3200 },
  { model: 'Mahindra Scorpio N', type: 'SUV', price: 4000 },
  { model: 'Mahindra XUV700', type: 'SUV', price: 4500 },
  { model: 'Tata Harrier', type: 'SUV', price: 4200 },
  { model: 'Tata Safari', type: 'SUV', price: 4800 },
  { model: 'MG Hector', type: 'SUV', price: 3800 },
  { model: 'Hyundai Alcazar', type: 'SUV', price: 4000 },
  { model: 'Mahindra Thar', type: 'SUV', price: 4500 },
  { model: 'Maruti Fronx', type: 'SUV', price: 2200 },
  { model: 'Kia Sonet', type: 'SUV', price: 2300 },
  { model: 'BMW X1', type: 'SUV', price: 10000 },
  { model: 'BMW X5', type: 'SUV', price: 20000 },
  { model: 'Audi Q3', type: 'SUV', price: 11000 },
  { model: 'Audi Q7', type: 'SUV', price: 22000 },
  { model: 'Volvo XC60', type: 'SUV', price: 18000 },
  { model: 'Land Rover Defender', type: 'SUV', price: 25000 },
  { model: 'Toyota Fortuner', type: 'SUV', price: 6000 },
  { model: 'Jeep Meridian', type: 'SUV', price: 5500 },
  { model: 'Jeep Compass', type: 'SUV', price: 4000 },

  // MUVS
  { model: 'Renault Triber', type: 'MUV', price: 1800 },
  { model: 'Toyota Innova Crysta', type: 'MUV', price: 4000 },
  { model: 'Toyota Innova Hycross', type: 'MUV', price: 5000 },
  { model: 'Kia Carens', type: 'MUV', price: 3500 },
  { model: 'Kia Carnival', type: 'MUV', price: 8000 },

  // EVS
  { model: 'BYD Seal', type: 'EV', price: 8000 },
  { model: 'Hyundai Ioniq 5', type: 'EV', price: 9000 },
  { model: 'BMW iX', type: 'EV', price: 25000 },
  { model: 'Mercedes-Benz EQS', type: 'EV', price: 30000 },
];

const IMAGES = {
  SUV: [
    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80',
    'https://images.unsplash.com/photo-1520031441872-265e4ff70366?w=800&q=80',
    'https://images.unsplash.com/photo-1606016159991-dfce8e408281?w=800&q=80',
    'https://images.unsplash.com/photo-1563720225384-9a588126b8cb?w=800&q=80',
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
    'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=800&q=80',
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80',
    'https://images.unsplash.com/photo-1571127236794-81c0bbef1651?w=800&q=80',
  ],
  Sedan: [
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
    'https://images.unsplash.com/photo-1532581140115-3e355d1ed1de?w=800&q=80',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80',
    'https://images.unsplash.com/photo-1553440569-bfc53b1299fd?w=800&q=80',
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80',
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
    'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=80',
    'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
    'https://images.unsplash.com/photo-1541899481282-d53bffe3c3d9?w=800&q=80',
  ],
  MUV: [
    'https://images.unsplash.com/photo-1527247043589-98e6ac08f56c?w=800&q=80',
    'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&q=80',
    'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&q=80',
  ],
  EV: [
    'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80',
    'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80',
    'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80',
    'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&q=80',
  ]
};

const generatePlateNumber = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const l1 = letters[Math.floor(Math.random() * letters.length)];
  const l2 = letters[Math.floor(Math.random() * letters.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `MH12 ${l1}${l2} ${num}`;
};

const seed = async () => {
  try {
    console.log('Connecting to database...');
    
    // 1. Delete all existing vehicles
    console.log('Clearing existing vehicles...');
    await pool.query('DELETE FROM Vehicle');
    console.log('Cleared!');

    // 2. Insert new cars
    console.log(`Inserting ${CARS_DATA.length} new vehicles...`);
    let count = 0;

    for (const car of CARS_DATA) {
      const condition = Math.random() > 0.8 ? 'Excellent' : 'Good';
      const mileage = Math.floor(5000 + Math.random() * 45000); // 5k to 50k
      const plateNo = generatePlateNumber();
      
      const typeImages = IMAGES[car.type];
      const imageUrl = typeImages[count % typeImages.length];

      await pool.query(`
        INSERT INTO Vehicle (plate_no, model, mileage, daily_price, \`condition\`, availability, vehicle_type, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [plateNo, car.model, mileage, car.price, condition, true, car.type, imageUrl]);

      count++;
    }

    console.log(`Successfully seeded ${count} vehicles!`);
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    process.exit(0);
  }
};

seed();
