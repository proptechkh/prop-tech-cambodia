-- Seed data for Prop Tech Cambodia
-- Run after schema.sql

-- Insert Cambodia provinces
INSERT OR IGNORE INTO locations (id, parent_id, location_type, name_km, name_en, name_zh) VALUES
('loc-phnom-penh', NULL, 'province', 'ភ្នំពេញ', 'Phnom Penh', '金边'),
('loc-siem-reap', NULL, 'province', 'សៀមរាប', 'Siem Reap', '暹粒'),
('loc-battambang', NULL, 'province', 'បាត់ដំបង', 'Battambang', '马德望'),
('loc-sihanoukville', NULL, 'province', 'ព្រះសីហនុ', 'Sihanoukville', '西哈努克'),
('loc-kampong-cham', NULL, 'province', 'កំពង់ចាម', 'Kampong Cham', '磅湛'),
('loc-kandal', NULL, 'province', 'កណ្ដាល', 'Kandal', '干丹'),
('loc-kampot', NULL, 'province', 'កំពត', 'Kampot', '贡布'),
('loc-kep', NULL, 'province', 'កែប', 'Kep', '白马'),
('loc-koh-kong', NULL, 'province', 'កោះកុង', 'Koh Kong', '戈公'),
('loc-pursat', NULL, 'province', 'ពោធិ៍សាត់', 'Pursat', '菩萨'),
('loc-preah-vihear', NULL, 'province', 'ព្រះវិហារ', 'Preah Vihear', '柏威夏'),
('loc-oddar-meanchey', NULL, 'province', 'ឧត្តរមានជ័យ', 'Oddar Meanchey', '奥多棉芷'),
('loc-mondulkiri', NULL, 'province', 'មណ្ឌលគិរី', 'Mondulkiri', '蒙多基里'),
('loc-ratanakiri', NULL, 'province', 'រតនគិរី', 'Ratanakiri', '拉达那基里'),
('loc-stung-treng', NULL, 'province', 'ស្ទឹងត្រែង', 'Stung Treng', '上丁'),
('loc-kratie', NULL, 'province', 'ក្រចេះ', 'Kratie', '桔井'),
('loc-takeo', NULL, 'province', 'តាកែវ', 'Takeo', '茶胶'),
('loc-kampong-speu', NULL, 'province', 'កំពង់ស្ពឺ', 'Kampong Speu', '磅士卑'),
('loc-kampong-chhnang', NULL, 'province', 'កំពង់ឆ្នាំង', 'Kampong Chhnang', '磅清扬'),
('loc-pailin', NULL, 'province', 'ប៉ៃលិន', 'Pailin', '拜林'),
('loc-banteay-meanchey', NULL, 'province', 'បន្ទាយមានជ័យ', 'Banteay Meanchey', '班迭棉芷');

-- Insert Phnom Penh districts
INSERT OR IGNORE INTO locations (id, parent_id, location_type, name_km, name_en, name_zh) VALUES
('loc-bkk1', 'loc-phnom-penh', 'district', 'បឹងកេងកង១', 'Chamkar Mon (BKK1)', '万景隆区'),
('loc-tuol-kouk', 'loc-phnom-penh', 'district', 'ទួលគោក', 'Tuol Kouk', '堆谷区'),
('loc-doun-penh', 'loc-phnom-penh', 'district', 'ដូនពេញ', 'Daun Penh', '隆边区'),
('loc-prampir-meakkakra', 'loc-phnom-penh', 'district', '៧មករា', 'Prampir Meakkakra', '7 Makara'),
('loc-chbar-ampov', 'loc-phnom-penh', 'district', 'ច្បារអំពៅ', 'Chbar Ampov', '占西邦区'),
('loc-russey-keo', 'loc-phnom-penh', 'district', 'ឫស្សីកែវ', 'Russey Keo', '水净华区'),
('loc-sen-sok', 'loc-phnom-penh', 'district', 'សែនសុខ', 'Sen Sok', '森速区'),
('loc-pou-senchey', 'loc-phnom-penh', 'district', 'ពោធិ៍សែនជ័យ', 'Pou Senchey', '普西尼加区'),
('loc-chraoy-changvar', 'loc-phnom-penh', 'district', 'ជ្រោយចង្វារ', 'Chraoy Changvar', '茶胶桥区'),
('loc-praek-pnov', 'loc-phnom-penh', 'district', 'ព្រែកព្នៅ', 'Praek Pnov', '北桥区'),
('loc-chamkar-leu', 'loc-phnom-penh', 'district', 'ចំការលើ', 'Chamkar Leu', '上朗区'),
('loc-dangkao', 'loc-phnom-penh', 'district', 'ដង្កោ', 'Dangkao', '丹高区'),
('loc-mean-chey', 'loc-phnom-penh', 'district', 'មានជ័យ', 'Mean Chey', '棉芷区');

-- Insert Siem Reap districts
INSERT OR IGNORE INTO locations (id, parent_id, location_type, name_km, name_en, name_zh) VALUES
('loc-siem-reap-city', 'loc-siem-reap', 'district', 'សៀមរាប', 'Siem Reap City', '暹粒市'),
('loc-angkor-chum', 'loc-siem-reap', 'district', 'អង្គរជុំ', 'Angkor Chum', '吴哥春'),
('loc-banteay-srei', 'loc-siem-reap', 'district', 'បន្ទាយស្រី', 'Banteay Srei', '班蒂斯雷'),
('loc-chi-kreng', 'loc-siem-reap', 'district', 'ជីក្រែង', 'Chi Kreng', '奇克雷ng'),
('loc-kralanh', 'loc-siem-reap', 'district', 'ក្រឡាញ់', 'Kralanh', '克拉拉nh'),
('loc-pouk', 'loc-siem-reap', 'district', 'ពក', 'Pouk', '普克'),
('loc-prasat-bakong', 'loc-siem-reap', 'district', 'ប្រាសាទបាគង', 'Prasat Bakong', '巴空寺'),
('loc-soutr-nikom', 'loc-siem-reap', 'district', 'សូទ្រនិគម', 'Soutr Nikom', '索特尼科姆'),
('loc-svay-leu', 'loc-siem-reap', 'district', 'ស្វាយលើ', 'Svay Leu', '斯维勒');

-- Insert demo users
-- Password for demo user: 'demo1234' (hashed)
INSERT OR IGNORE INTO users (id, name, email, phone, password_hash, role, status, verified, created_at, updated_at) VALUES
('user-demo-agent', 'Prop Tech Partner', 'agent@proptech.com.kh', '+85512345678', 'ZGVtbzEyMzRwcm9wLXRlY2gtc2FsdA==', 'agent', 'active', 1, unixepoch(), unixepoch()),
('user-demo-owner', 'Property Owner', 'owner@proptech.com.kh', '+85598123456', 'ZGVtbzEyMzRwcm9wLXRlY2gtc2FsdA==', 'owner', 'active', 1, unixepoch(), unixepoch());

-- Insert sample properties
INSERT OR IGNORE INTO properties (id, owner_id, title, description, property_type, listing_type, status, price, currency, city, address_text, bedrooms, bathrooms, floor_area, land_area, contact_phone, telegram, created_at, updated_at) VALUES
('prop-1', 'user-demo-agent', 'Modern family villa', 'Bright family home with spacious living areas and convenient access to shops and schools.', 'Villa', 'sale', 'active', 185000, 'USD', 'Phnom Penh', 'BKK1, Chamkar Mon', 4, 3, 220, 300, '+85512345678', '', unixepoch(), unixepoch()),
('prop-2', 'user-demo-owner', 'Furnished city apartment', 'Comfortable furnished apartment close to cafes, offices and daily amenities.', 'Apartment', 'rent', 'active', 450, 'USD', 'Phnom Penh', 'BKK1, Chamkar Mon', 1, 1, 58, 0, '+85598123456', '', unixepoch(), unixepoch()),
('prop-3', 'user-demo-agent', 'Contemporary townhouse', 'Well-planned townhouse with practical layout and family-friendly neighborhood.', 'House', 'sale', 'active', 125000, 'USD', 'Phnom Penh', 'Sen Sok', 3, 3, 120, 150, '+85512345678', '', unixepoch(), unixepoch()),
('prop-4', 'user-demo-owner', 'Residential land plot', 'Land opportunity in a developing area. Please contact the advertiser for exact location and title details.', 'Land', 'sale', 'active', 85000, 'USD', 'Kandal', 'Kandal Province', 0, 0, 0, 300, '+85598123456', '', unixepoch(), unixepoch()),
('prop-5', 'user-demo-agent', 'Modern condo with balcony', 'Modern condo with natural light, shared amenities and easy city access', 'Condo', 'rent', 'active', 600, 'USD', 'Phnom Penh', 'Chamkar Mon', 2, 1, 75, 0, '+85512345678', '', unixepoch(), unixepoch());

-- Insert property images
INSERT OR IGNORE INTO property_images (id, property_id, storage_path, sort_order, is_cover, created_at) VALUES
('img-1', 'prop-1', 'properties/demo/villa1.jpg', 0, 1, unixepoch()),
('img-2', 'prop-2', 'properties/demo/apartment1.jpg', 0, 1, unixepoch()),
('img-3', 'prop-3', 'properties/demo/townhouse1.jpg', 0, 1, unixepoch()),
('img-4', 'prop-4', 'properties/demo/land1.jpg', 0, 1, unixepoch()),
('img-5', 'prop-5', 'properties/demo/condo1.jpg', 0, 1, unixepoch());

-- Insert translations
INSERT OR IGNORE INTO property_translations (property_id, language_code, title, description) VALUES
('prop-1', 'km', 'វីឡាគ្រួសារទំនើប', 'ផ្ទះគ្រួសារភ្លឺច្បាលជាមួយនឹងកន្លែងរស់នៅធំទូលាយ និងភាពងាយស្រួលក្នុងការចូលដំណើរការផ្សារ និងសាលារៀន។'),
('prop-1', 'zh-CN', '现代家庭别墅', '明亮的家庭住宅，拥有宽敞的生活区域，方便前往商店和学校。'),
('prop-2', 'km', 'ផ្ទះជួលសំណង់ទំនើប', 'ផ្ទះជួលសំណង់ទំនើបនៅជិតហាងកាហ្វេ ការិយាល័យ និងកន្លែងទិញទំនិញប្រចាំថ្ងៃ។'),
('prop-2', 'zh-CN', '精装城市公寓', '舒适的精装公寓，靠近咖啡馆、办公室和日常设施。'),
('prop-3', 'km', 'ផ្ទះជាប់គ្នាទំនើប', 'ផ្ទះជាប់គ្នាទំនើបដែលមានការរៀបចំសមរម្យ និងបណ្តាញសហគមន៍គ្រួសារ។'),
('prop-3', 'zh-CN', '现代联排别墅', '规划合理的联排别墅，拥有实用的布局和适合家庭的社区。'),
('prop-4', 'km', 'ដីស្រឡាញ់សំណង់', 'ដីស្រឡាញ់សំណង់នៅតំបន់កំពុងអភិវឌ្ឍន៍។ សូមទាក់ទងអ្នកផ្សព្វផ្សាយសម្រាប់ព័ត៌មានលម្អិត។'),
('prop-4', 'zh-CN', '住宅用地', '发展区的土地机会。请联系广告商了解确切位置和产权详情。'),
('prop-5', 'km', 'ខុនដូទំនើបជាមួយនឹងរោងមើល', 'ខុនដូទំនើបដែលមានពន្លឺធម្មជាតិ សេវាកម្មរួម និងភាពងាយស្រួលក្នុងការចូលដំណើរការទីក្រុង'),
('prop-5', 'zh-CN', '现代阳台公寓', '现代公寓，自然光线充足，共享设施，交通便利');
