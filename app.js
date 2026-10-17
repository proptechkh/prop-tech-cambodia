// Prop Tech Cambodia - Production Frontend
// Uses Cloudflare Workers API for all backend operations

const API_BASE = 'https://prop-tech-cambodia.genzkh855.workers.dev/api';

// ==================== STATE ====================
let currentUser = null;
let authToken = localStorage.getItem('pt_auth_token') || null;
let properties = [];
let favorites = [];
let reports = [];
let currentProperty = null;
let mode = 'sale';
let postMode = 'sale';
let currentAdminTab = 'listings';
let installPrompt = null;

// ==================== I18N ====================
const I18N = {
  en: {
    eyebrow: "CAMBODIA PROPERTY MARKETPLACE", heroTitle: "Find a place to call home.",
    heroText: "Explore homes, land and commercial properties across Cambodia.",
    buy: "Buy", rent: "Rent", location: "Location", propertyType: "Property type",
    allTypes: "All property types", minPrice: "Min price ($)", maxPrice: "Max price ($)",
    search: "Search properties", browse: "BROWSE", popularTypes: "Explore property types",
    clearFilters: "Clear filters", house: "House", condo: "Condo", land: "Land",
    villa: "Villa", commercial: "Commercial", curated: "FIND YOUR NEXT MOVE",
    latestListings: "Latest properties", noResults: "No properties found",
    tryFilters: "Try changing your search filters.", haveProperty: "Have a property to sell or rent?",
    postCTA: "Reach people looking for their next home.", postProperty: "Post a property",
    backToSearch: "Back to search", yourAccount: "YOUR ACCOUNT", welcome: "Welcome to Prop Tech",
    signIn: "Sign in", signUp: "Sign up", email: "Email", password: "Password",
    confirmPassword: "Confirm password", name: "Full name", phone: "Phone number",
    role: "I am a", owner: "Property owner", agent: "Sales agent",
    continue: "Continue", back: "Back", newListing: "NEW LISTING", postTitle: "Post a property",
    postIntro: "Fill in the essentials. Your listing appears immediately after validation.",
    listingType: "Listing type *", forSale: "For sale", forRent: "For rent",
    titleLabel: "Property title *", description: "Description", priceLabel: "Price (USD) *",
    province: "Province / city *", bedrooms: "Bedrooms", bathrooms: "Bathrooms",
    floorArea: "Floor area (m2)", contactPhone: "Contact phone *",
    telegram: "Telegram username or link (optional)", photos: "Photos (up to 5)",
    photoHint: "Upload up to 5 photos. First photo will be the cover image.",
    confirmOwnership: "I confirm that I am authorized to advertise this property.",
    publish: "Publish property now", myListings: "My listings", savedProperties: "Saved properties",
    home: "Home", searchNav: "Search", postNav: "Post", savedNav: "Saved", accountNav: "Account",
    footerText: "Buy - Sell - Rent with confidence", sale: "For sale", forRentBadge: "For rent",
    beds: "beds", baths: "baths", area: "m2", contactAdvertiser: "Contact advertiser",
    callNow: "Call now", telegramContact: "Contact via Telegram", report: "Report property",
    descriptionTitle: "Description", locationTitle: "Location", postedBy: "Posted by",
    active: "Active", paused: "Paused", sold: "Sold", rented: "Rented",
    edit: "Edit", pause: "Pause", activate: "Activate", markSold: "Mark as sold",
    markRented: "Mark as rented", delete: "Delete", listingPublished: "Your property is now live!",
    needAccount: "Please sign in to post a property.", signInFirst: "Please sign in first.",
    saved: "Saved", removedSaved: "Removed from favorites",
    reported: "Report submitted for review.", cancel: "Cancel", submit: "Submit",
    noSaved: "No saved properties yet.", noMine: "You haven't posted any properties yet.",
    welcomeBack: "Welcome back", signOut: "Sign out", loginSuccess: "Logged in successfully",
    signupSuccess: "Account created! Please check your email for verification.",
    listingHidden: "Listing paused", listingRestored: "Listing activated",
    confirmDelete: "Are you sure you want to delete this property?",
    published: "Published", reportedListings: "Reported listings", users: "Users",
    listings: "Listings", reports: "Reports", contact: "Contact", status: "Status",
    ownerAgent: "Owner / Agent", adminDashboard: "Admin Dashboard", totalListings: "Total listings",
    activeListings: "Active listings", totalUsers: "Total users", openReports: "Open reports",
    viewAll: "View all", noReports: "No open reports", noUsers: "No users yet",
    userSuspended: "User suspended", userActivated: "User activated",
    resolveReport: "Resolve", dismissReport: "Dismiss", removeListing: "Remove",
    restoreListing: "Restore", hideListing: "Hide", viewProperty: "View",
    loading: "Loading...", error: "Something went wrong. Please try again.",
    invalidCredentials: "Invalid email or password", emailRequired: "Email is required",
    passwordRequired: "Password is required", nameRequired: "Name is required",
    phoneRequired: "Phone number is required", propertyNotFound: "Property not found",
    unauthorized: "Please sign in to continue", forbidden: "Access denied",
    rateLimited: "Too many requests. Please slow down.",
    verifyEmail: "Please verify your email before posting.",
    otpSent: "Verification code sent to your email",
    otpInvalid: "Invalid or expired verification code",
    otpRequired: "Verification code is required",
  },
  km: {
    eyebrow: "ទីផ្សារអចលនទ្រព្យកម្ពុជា", heroTitle: "ស្វែងរកកន្លែងដែលអ្នកហៅថាផ្ទះ។",
    heroText: "ស្វែងរកផ្ទះ ដី និងអចលនទ្រព្យពាណិជ្ជកម្មទូទាំងកម្ពុជា។",
    buy: "ទិញ", rent: "ជួល", location: "ទីតាំង", propertyType: "ប្រភេទអចលនទ្រព្យ",
    allTypes: "គ្រប់ប្រភេទ", minPrice: "តម្លៃអប្បបរមា ($)", maxPrice: "តម្លៃអតិបរមា ($)",
    search: "ស្វែងរកអចលនទ្រព្យ", browse: "ស្វែងរក", popularTypes: "ស្វែងរកតាមប្រភេទ",
    clearFilters: "សម្អាតតម្រង", house: "ផ្ទះ", condo: "ខុនដូ", land: "ដី",
    villa: "វីឡា", commercial: "ពាណិជ្ជកម្ម", curated: "ស្វែងរកអចលនទ្រព្យរបស់អ្នក",
    latestListings: "អចលនទ្រព្យថ្មីៗ", noResults: "រកមិនឃើញអចលនទ្រព្យ",
    tryFilters: "សូមប្តូរលក្ខខណ្ឌស្វែងរក។", haveProperty: "មានអចលនទ្រព្យសម្រាប់លក់ ឬជួលមែនទេ?",
    postCTA: "ជួយឱ្យអ្នកកំពុងស្វែងរកឃើញអចលនទ្រព្យរបស់អ្នក។", postProperty: "ប្រកាសអចលនទ្រព្យ",
    backToSearch: "ត្រឡប់ទៅការស្វែងរក", yourAccount: "គណនីរបស់អ្នក", welcome: "សូមស្វាគមន៍មកកាន់ Prop Tech",
    signIn: "ចូល", signUp: "ចុះឈ្មោះ", email: "អ៊ីមែល", password: "ពាក្យសម្ងាត់",
    confirmPassword: "បញ្ជាក់ពាក្យសម្ងាត់", name: "ឈ្មោះពេញ", phone: "លេខទូរស័ព្ទ",
    role: "ខ្ញុំជា", owner: "ម្ចាស់អចលនទ្រព្យ", agent: "ភ្នាក់ងារលក់",
    continue: "បន្ត", back: "ត្រឡប់", newListing: "ប្រកាសថ្មី", postTitle: "ប្រកាសអចលនទ្រព្យ",
    postIntro: "បញ្ចូលព័ត៌មានចាំបាច់។ ប្រកាសនឹងបង្ហាញភ្លាមៗបន្ទាប់ពីផ្ទៀងផ្ទាត់។",
    listingType: "ប្រភេទប្រកាស *", forSale: "សម្រាប់លក់", forRent: "សម្រាប់ជួល",
    titleLabel: "ចំណងជើងអចលនទ្រព្យ *", description: "ការពិពណ៌នា", priceLabel: "តម្លៃ (USD) *",
    province: "ខេត្ត / ក្រុង *", bedrooms: "បន្ទប់គេង", bathrooms: "បន្ទប់ទឹក",
    floorArea: "ទំហំជាន់ (m2)", contactPhone: "លេខទំនាក់ទំនង *",
    telegram: "ឈ្មោះ ឬតំណ Telegram (ជាជម្រើស)", photos: "រូបភាព (អតិបរមា 5)",
    photoHint: "ផ្ទុករូបភាពបានរហូតដល់ 5 រូប។ រូបដំបូងនឹងជារូបកំពូល។",
    confirmOwnership: "ខ្ញុំបញ្ជាក់ថាមានសិទ្ធិផ្សព្វផ្សាយអចលនទ្រព្យនេះ។",
    publish: "ផ្សព្វផ្សាយឥឡូវនេះ", myListings: "ប្រកាសរបស់ខ្ញុំ", savedProperties: "អចលនទ្រព្យដែលបានរក្សាទុក",
    home: "ទំព័រដើម", searchNav: "ស្វែងរក", postNav: "ប្រកាស", savedNav: "បានរក្សាទុក", accountNav: "គណនី",
    footerText: "ទិញ - លក់ - ជួលដោយទំនុកចិត្ត", sale: "សម្រាប់លក់", forRentBadge: "សម្រាប់ជួល",
    beds: "បន្ទប់គេង", baths: "បន្ទប់ទឹក", area: "m2", contactAdvertiser: "ទាក់ទងអ្នកផ្សព្វផ្សាយ",
    callNow: "ហៅឥឡូវនេះ", telegramContact: "ទាក់ទងតាម Telegram", report: "រាយការណ៍អចលនទ្រព្យ",
    descriptionTitle: "ការពិពណ៌នា", locationTitle: "ទីតាំង", postedBy: "បានប្រកាសដោយ",
    active: "សកម្ម", paused: "ផ្អាក", sold: "លក់រួច", rented: "ជួលរួច",
    edit: "កែសម្រួល", pause: "ផ្អាក", activate: "ដាក់ឲ្យដំណើរការ", markSold: "សម្គាល់ថាលក់រួច",
    markRented: "សម្គាល់ថាជួលរួច", delete: "លុប", listingPublished: "អចលនទ្រព្យរបស់អ្នកឥឡូវនេះបានដាក់ឲ្យដំណើរការ!",
    needAccount: "សូមចូលដើម្បីប្រកាសអចលនទ្រព្យ។", signInFirst: "សូមចូលជាមុនសិន។",
    saved: "បានរក្សាទុក", removedSaved: "បានដកចេញពីបញ្ជីចូលចិត្ត",
    reported: "របាយការណ៍ត្រូវបានដាក់ស្នើសុំការពិនិត្យពិនិត្យ។", cancel: "បោះបង់", submit: "ដាក់ស្នើ",
    noSaved: "មិនទាន់មានអចលនទ្រព្យដែលបានរក្សាទុកទេ។", noMine: "អ្នកមិនទាន់បានប្រកាសអចលនទ្រព្យទេ។",
    welcomeBack: "ស្វាគមន៍មកវិញ", signOut: "ចាកចេញ", loginSuccess: "ចូលប្រើប្រាស់បានជោគជ័យ",
    signupSuccess: "បង្កើតគណនីរួចរាល់! សូមពិនិត្យអ៊ីមែលរបស់អ្នកសម្រាប់ការផ្ទៀងផ្ទាត់។",
    listingHidden: "បានផ្អាកអចលនទ្រព្យ", listingRestored: "បានដាក់ឲ្យដំណើរការអចលនទ្រព្យ",
    confirmDelete: "តើអ្នកប្រាកដជាចង់លុបអចលនទ្រព្យនេះទេ?",
    published: "បានផ្សព្វផ្សាយ", reportedListings: "អចលនទ្រព្យដែលត្រូវបានរាយការណ៍", users: "អ្នកប្រើប្រាស់",
    listings: "អចលនទ្រព្យ", reports: "របាយការណ៍", contact: "ទំនាក់ទំនង", status: "ស្ថានភាព",
    ownerAgent: "ម្ចាស់ / ភ្នាក់ងារ", adminDashboard: "ផ្ទាំងគ្រប់គ្រងអ្នកគ្រប់គ្រង",
    totalListings: "អចលនទ្រព្យសរុប", activeListings: "អចលនទ្រព្យសកម្ម",
    totalUsers: "អ្នកប្រើប្រាស់សរុប", openReports: "របាយការណ៍បើក",
    viewAll: "មើលទាំងអស់", noReports: "គ្មានរបាយការណ៍បើកទេ", noUsers: "គ្មានអ្នកប្រើប្រាស់ទេ",
    userSuspended: "បានផ្អាកអ្នកប្រើប្រាស់", userActivated: "បានដាក់ឲ្យដំណើរការអ្នកប្រើប្រាស់",
    resolveReport: "ដោះស្រាយ", dismissReport: "បដិសេធ", removeListing: "លុប",
    restoreListing: "ស្តារ", hideListing: "លាក់", viewProperty: "មើល",
    loading: "កំពុងផ្ទុក...", error: "មានបញ្ហាកើតឡើង។ សូមព្យាយាមម្តងទៀត។",
    invalidCredentials: "អ៊ីមែលឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ", emailRequired: "តម្រូវការអ៊ីមែល",
    passwordRequired: "តម្រូវការពាក្យសម្ងាត់", nameRequired: "តម្រូវការឈ្មោះ",
    phoneRequired: "តម្រូវការលេខទូរស័ព្ទ", propertyNotFound: "រកមិនឃើញអចលនទ្រព្យ",
    unauthorized: "សូមចូលដើម្បីបន្ត", forbidden: "ការចូលដំណើរការត្រូវបានបដិសេធ",
    rateLimited: "សំណើច្រើនពេក។ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ។",
    verifyEmail: "សូមផ្ទៀងផ្ទាត់អ៊ីមែលរបស់អ្នកមុនពេលប្រកាស។",
    otpSent: "លេខកូដផ្ទៀងផ្ទាត់ត្រូវបានផ្ញើទៅអ៊ីមែលរបស់អ្នក",
    otpInvalid: "លេខកូដផ្ទៀងផ្ទាត់មិនត្រឹមត្រូវឬផុតកំណត់",
    otpRequired: "តម្រូវការលេខកូដផ្ទៀងផ្ទាត់",
  },
  "zh-CN": {
    eyebrow: "柬埔寨房地产市场", heroTitle: "寻找属于您的家。",
    heroText: "浏览柬埔寨各地的住宅、土地和商业地产。",
    buy: "买房", rent: "租房", location: "位置", propertyType: "房产类型",
    allTypes: "所有房产类型", minPrice: "最低价格 ($)", maxPrice: "最高价格 ($)",
    search: "搜索房产", browse: "浏览", popularTypes: "按房产类型查找",
    clearFilters: "清除筛选", house: "住宅", condo: "公寓", land: "土地",
    villa: "别墅", commercial: "商业地产", curated: "寻找您的理想房产",
    latestListings: "最新房源", noResults: "没有找到房产",
    tryFilters: "请尝试调整搜索条件。", haveProperty: "有房产需要出售或出租？",
    postCTA: "让正在寻找房产的人发现您的房源。", postProperty: "发布房源",
    backToSearch: "返回搜索", yourAccount: "您的账户", welcome: "欢迎来到 Prop Tech",
    signIn: "登录", signUp: "注册", email: "电子邮箱", password: "密码",
    confirmPassword: "确认密码", name: "姓名", phone: "电话号码",
    role: "我的身份", owner: "房产所有者", agent: "销售代理",
    continue: "继续", back: "返回", newListing: "新房源", postTitle: "发布房产",
    postIntro: "填写必要信息。验证通过后房源将立即上线。",
    listingType: "房源类型 *", forSale: "出售", forRent: "出租",
    titleLabel: "房源标题 *", description: "房源描述", priceLabel: "价格（美元）*",
    province: "省 / 市 *", bedrooms: "卧室", bathrooms: "浴室",
    floorArea: "建筑面积（平方米）", contactPhone: "联系电话 *",
    telegram: "Telegram 用户名或链接（可选）", photos: "照片（最多 5 张）",
    photoHint: "最多上传 5 张照片。第一张将作为封面图片。",
    confirmOwnership: "我确认有权发布此房产信息。",
    publish: "立即发布房源", myListings: "我的房源", savedProperties: "收藏的房产",
    home: "首页", searchNav: "搜索", postNav: "发布", savedNav: "收藏", accountNav: "账户",
    footerText: "安心买卖租赁", sale: "出售", forRentBadge: "出租",
    beds: "卧室", baths: "浴室", area: "平方米", contactAdvertiser: "联系发布者",
    callNow: "立即致电", telegramContact: "通过 Telegram 联系", report: "举报房源",
    descriptionTitle: "房源介绍", locationTitle: "位置", postedBy: "发布者",
    active: "在线", paused: "已暂停", sold: "已售", rented: "已出租",
    edit: "编辑", pause: "暂停", activate: "重新上线", markSold: "标记为已售",
    markRented: "标记为已出租", delete: "删除", listingPublished: "您的房源已上线！",
    needAccount: "请先登录再发布房源。", signInFirst: "请先登录。",
    saved: "已收藏", removedSaved: "已取消收藏",
    reported: "举报已提交，等待管理员审核。", cancel: "取消", submit: "提交",
    noSaved: "暂无收藏房产。", noMine: "您尚未发布任何房源。",
    welcomeBack: "欢迎回来", signOut: "退出登录", loginSuccess: "登录成功",
    signupSuccess: "账户创建成功！请查收验证邮件。",
    listingHidden: "房源已暂停", listingRestored: "房源已恢复",
    confirmDelete: "确定删除此房产吗？",
    published: "已发布", reportedListings: "被举报房源", users: "用户",
    listings: "房源", reports: "举报", contact: "联系", status: "状态",
    ownerAgent: "业主 / 代理", adminDashboard: "管理仪表板",
    totalListings: "总房源", activeListings: "在线房源",
    totalUsers: "总用户", openReports: "待处理举报",
    viewAll: "查看全部", noReports: "暂无举报", noUsers: "暂无用户",
    userSuspended: "用户已暂停", userActivated: "用户已激活",
    resolveReport: "解决", dismissReport: "驳回", removeListing: "删除",
    restoreListing: "恢复", hideListing: "隐藏", viewProperty: "查看",
    loading: "加载中...", error: "出错了，请重试。",
    invalidCredentials: "邮箱或密码错误", emailRequired: "请输入邮箱",
    passwordRequired: "请输入密码", nameRequired: "请输入姓名",
    phoneRequired: "请输入电话号码", propertyNotFound: "未找到房产",
    unauthorized: "请先登录", forbidden: "访问被拒绝",
    rateLimited: "请求过于频繁，请稍后再试。",
    verifyEmail: "发布前请先验证邮箱。",
    otpSent: "验证码已发送到您的邮箱",
    otpInvalid: "验证码错误或已过期",
    otpRequired: "请输入验证码",
  }
};

const t = (k) => (I18N[document.getElementById('language')?.value || 'en'] || I18N.en)[k] || I18N.en[k] || k;

// ==================== API HELPERS ====================
async function api(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    authToken = null;
    localStorage.removeItem('pt_auth_token');
    currentUser = null;
    updateAuthUI();
    throw new Error('Unauthorized');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }

  return data;
}

// ==================== AUTH ====================
async function signup(name, email, phone, password, role) {
  const data = await api('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, phone, password, role }),
  });
  return data;
}

async function login(email, password) {
  const data = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  authToken = data.token;
  currentUser = data.user;
  localStorage.setItem('pt_auth_token', authToken);
  updateAuthUI();
  return data;
}

async function verifyOTP(userId, otp) {
  const data = await api('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ userId, otp }),
  });
  authToken = data.token;
  currentUser = data.user;
  localStorage.setItem('pt_auth_token', authToken);
  updateAuthUI();
  return data;
}

async function logout() {
  try {
    await api('/auth/logout', { method: 'POST' });
  } catch (e) { /* ignore */ }
  authToken = null;
  currentUser = null;
  localStorage.removeItem('pt_auth_token');
  updateAuthUI();
  showPage('home');
}

async function checkAuth() {
  if (!authToken) return;
  try {
    const data = await api('/auth/me');
    currentUser = data.user;
    updateAuthUI();
  } catch (e) {
    authToken = null;
    localStorage.removeItem('pt_auth_token');
  }
}

function updateAuthUI() {
  const btn = document.getElementById('accountBtn');
  if (currentUser) {
    btn.textContent = currentUser.name.split(' ')[0];
    btn.onclick = () => showPage('account');
  } else {
    btn.textContent = t('signIn');
    btn.onclick = () => showPage('account');
  }
}

// ==================== PROPERTIES ====================
async function loadProperties(filters = {}) {
  const params = new URLSearchParams({ mode, ...filters });
  const data = await api(`/properties?${params}`);
  properties = data.properties;
  renderListings();
}

async function loadProperty(id) {
  const data = await api(`/properties/${id}`);
  currentProperty = data.property;
  return currentProperty;
}

async function createProperty(formData) {
  const data = await api('/properties', {
    method: 'POST',
    body: JSON.stringify(formData),
  });
  return data;
}

async function updateProperty(id, formData) {
  const data = await api(`/properties/${id}`, {
    method: 'PUT',
    body: JSON.stringify(formData),
  });
  return data;
}

async function deleteProperty(id) {
  const data = await api(`/properties/${id}`, { method: 'DELETE' });
  return data;
}

async function changePropertyStatus(id, status) {
  const data = await api(`/properties/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
  return data;
}

// ==================== FAVORITES ====================
async function loadFavorites() {
  if (!currentUser) return [];
  const data = await api('/favorites');
  favorites = data.favorites;
  return favorites;
}

async function toggleFavorite(propertyId) {
  if (!currentUser) {
    toast(t('signInFirst'), true);
    showPage('account');
    return;
  }

  const isFav = favorites.some(f => f.id === propertyId);
  if (isFav) {
    await api(`/favorites/${propertyId}`, { method: 'DELETE' });
    favorites = favorites.filter(f => f.id !== propertyId);
  } else {
    await api('/favorites', {
      method: 'POST',
      body: JSON.stringify({ propertyId }),
    });
    const prop = properties.find(p => p.id === propertyId);
    if (prop) favorites.push(prop);
  }

  renderListings();
  if (!document.getElementById('detailPage').hidden) {
    openDetail(propertyId);
  }
  toast(isFav ? t('removedSaved') : t('saved'));
}

// ==================== REPORTS ====================
async function reportProperty(propertyId, reason, details) {
  if (!currentUser) {
    toast(t('signInFirst'), true);
    showPage('account');
    return;
  }
  await api('/reports', {
    method: 'POST',
    body: JSON.stringify({ propertyId, reason, details }),
  });
  toast(t('reported'));
}

// ==================== UPLOAD ====================
async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  const data = await api('/upload', {
    method: 'POST',
    body: formData,
  });
  return data;
}

// ==================== UI FUNCTIONS ====================
function toast(msg, error = false) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.hidden = false;
  el.classList.toggle('error', error);
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => el.hidden = true, 3000);
}

function money(n) {
  return '$' + Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function safe(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.hidden = true);
  const target = document.getElementById(page + 'Page');
  if (target) target.hidden = false;

  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  const navIndex = { home: 0, detail: -1, post: 2, saved: 3, account: 4, myListings: 4, admin: -1 }[page];
  if (navIndex >= 0) document.querySelectorAll('.nav-item')[navIndex]?.classList.add('active');

  if (page === 'home') renderListings();
  if (page === 'account') renderAccount();
  if (page === 'post' && !currentUser) {
    toast(t('needAccount'), true);
    showPage('account');
    return;
  }
  if (page === 'myListings') renderMyListings();
  if (page === 'saved') renderSaved();
  if (page === 'admin') renderAdmin();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderListings() {
  const q = (document.getElementById('searchLocation').value || '').trim().toLowerCase();
  const type = document.getElementById('searchType').value;
  const min = Number(document.getElementById('minPrice').value) || 0;
  const max = Number(document.getElementById('maxPrice').value) || Infinity;

  const items = properties
    .filter(p => {
      const matchMode = p.listing_type === mode;
      const matchQuery = !q || (p.city || '').toLowerCase().includes(q) || (p.title || '').toLowerCase().includes(q);
      const matchType = !type || p.property_type === type;
      const matchPrice = p.price >= min && p.price <= max;
      return matchMode && matchQuery && matchType && matchPrice;
    })
    .sort((a, b) => b.created_at - a.created_at);

  document.getElementById('resultCount').textContent = items.length + ' ' + (items.length === 1 ? 'property' : 'properties');
  document.getElementById('listingHeading').textContent = t('latestListings');
  document.getElementById('listingGrid').innerHTML = items.map(cardHTML).join('');
  document.getElementById('emptyState').hidden = items.length > 0;
}

function cardHTML(p) {
  const saved = favorites.some(f => f.id === p.id);
  const img = p.images?.[0]?.storage_path || p.images?.[0] || '';
  const imgUrl = img.startsWith('http') ? img : (img ? `${API_BASE}/images/${img}` : '');
  return `<article class="property-card">
    <img class="property-image" src="${safe(imgUrl)}" alt="${safe(p.title)}" loading="lazy" onclick="openDetail('${p.id}')">
    <div class="property-body">
      <div class="property-top">
        <span class="pill ${p.listing_type === 'rent' ? 'rent' : ''}">${p.listing_type === 'rent' ? t('forRentBadge') : t('sale')}</span>
        <button class="heart ${saved ? 'saved' : ''}" aria-label="Save property" onclick="toggleFavorite('${p.id}')">${saved ? '♥' : '♡'}</button>
      </div>
      <div class="property-title" onclick="openDetail('${p.id}')">${safe(p.title)}</div>
      <div class="price">${money(p.price)}${p.listing_type === 'rent' ? '<small style="font-size:12px;color:#68748a;font-weight:600"> / month</small>' : ''}</div>
      <div class="location-line">⌖ ${safe(p.city)}</div>
      <div class="meta">
        ${p.bedrooms ? `<span>▱ ${p.bedrooms} ${t('beds')}</span>` : ''}
        ${p.bathrooms ? `<span>♧ ${p.bathrooms} ${t('baths')}</span>` : ''}
        ${p.floor_area ? `<span>↔ ${p.floor_area} ${t('area')}</span>` : ''}
      </div>
    </div>
  </article>`;
}

function applySearch() {
  mode = document.querySelector('[data-mode].active')?.dataset.mode || mode;
  renderListings();
  document.getElementById('listingHeading').textContent = t('search');
  document.getElementById('listingGrid').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function clearSearch() {
  document.getElementById('searchLocation').value = '';
  document.getElementById('searchType').value = '';
  document.getElementById('minPrice').value = '';
  document.getElementById('maxPrice').value = '';
  mode = 'sale';
  document.querySelectorAll('[data-mode]').forEach(b => b.classList.toggle('active', b.dataset.mode === 'sale'));
  renderListings();
}

function quickType(type) {
  document.getElementById('searchType').value = type;
  applySearch();
}

async function openDetail(id) {
  try {
    const p = await loadProperty(id);
    if (!p) { toast(t('propertyNotFound'), true); return; }
    showPage('detail');
    const lang = document.getElementById('language').value;
    const trans = p.translations?.find(tr => tr.language_code === lang);
    const title = trans?.title || p.title;
    const desc = trans?.description || p.description || '—';
    const img = p.images?.[0]?.storage_path || '';
    const imgUrl = img.startsWith('http') ? img : (img ? `${API_BASE}/images/${img}` : '');

    document.getElementById('detailContent').innerHTML = `
      <img class="detail-hero" src="${safe(imgUrl)}" alt="${safe(title)}">
      <div class="detail-layout">
        <div>
          <span class="pill ${p.listing_type === 'rent' ? 'rent' : ''}">${p.listing_type === 'rent' ? t('forRentBadge') : t('sale')}</span>
          <h1>${safe(title)}</h1>
          <div class="detail-price">${money(p.price)}${p.listing_type === 'rent' ? ' / month' : ''}</div>
          <p class="location-line">⌖ ${safe(p.city)}</p>
          <div class="meta">
            ${p.bedrooms ? `<span>▱ ${p.bedrooms} ${t('beds')}</span>` : ''}
            ${p.bathrooms ? `<span>♧ ${p.bathrooms} ${t('baths')}</span>` : ''}
            ${p.floor_area ? `<span>↔ ${p.floor_area} ${t('area')}</span>` : ''}
          </div>
          <h3 style="margin-top:28px">${t('descriptionTitle')}</h3>
          <p>${safe(desc)}</p>
          <h3>${t('locationTitle')}</h3>
          <p>${safe(p.city)}${p.address_text ? ', ' + safe(p.address_text) : ''}</p>
          <p class="muted">${t('postedBy')}: ${safe(p.owner_name || 'Prop Tech user')}</p>
        </div>
        <aside class="contact-card">
          <h3>${t('contactAdvertiser')}</h3>
          <p class="muted">${safe(p.owner_name || 'Property advertiser')}</p>
          <a class="primary full" href="tel:${safe(p.contact_phone)}">☎ ${t('callNow')}</a>
          ${p.telegram ? `<a class="outline-btn" target="_blank" rel="noopener" href="${safe(telegramUrl(p.telegram))}">✈ ${t('telegramContact')}</a>` : ''}
          <button class="outline-btn" onclick="showReportModal('${p.id}')">⚑ ${t('report')}</button>
          <button class="outline-btn" onclick="shareProperty('${p.id}')">${t('share')}</button>
        </aside>
      </div>`;
  } catch (e) {
    toast(t('error'), true);
  }
}

function telegramUrl(s) {
  return s.startsWith('http') ? s : 'https://t.me/' + s.replace(/^@/, '');
}

function showReportModal(propertyId) {
  const reason = prompt(t('report') + '\n1. Spam\n2. Fraud\n3. Wrong info\n4. Other');
  if (reason === null) return;
  const reasons = { '1': 'Spam', '2': 'Fraud', '3': 'Wrong information', '4': 'Other' };
  reportProperty(propertyId, reasons[reason] || reason, '');
}

function shareProperty(id) {
  const url = location.href.split('#')[0] + '#property=' + encodeURIComponent(id);
  if (navigator.share) navigator.share({ title: 'Prop Tech property', url }).catch(() => {});
  else if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => toast('Link copied'));
  else prompt('Copy property link', url);
}

// ==================== ACCOUNT ====================
function renderAccount() {
  const form = document.getElementById('accountForm');
  const signedIn = document.getElementById('signedIn');

  if (currentUser) {
    form.hidden = true;
    signedIn.hidden = false;
    signedIn.innerHTML = `
      <div class="stat" style="margin-top:18px">
        <span>${t('name')}</span>
        <b style="font-size:20px">${safe(currentUser.name)}</b>
        <span>${safe(currentUser.email)} · ${safe(currentUser.phone)} · ${safe(currentUser.role)}</span>
      </div>
      <div class="row-actions" style="margin-top:16px;padding:0">
        <button class="primary" onclick="showPage('post')">${t('postProperty')}</button>
        <button class="mini-btn" onclick="showPage('myListings')">${t('myListings')}</button>
        ${currentUser.role === 'admin' ? '<button class="mini-btn" onclick="showPage(\'admin\')">Admin dashboard</button>' : ''}
        <button class="mini-btn" onclick="logout()">${t('signOut')}</button>
      </div>`;
  } else {
    form.hidden = false;
    signedIn.hidden = true;
  }
}

// ==================== MY LISTINGS ====================
async function renderMyListings() {
  if (!currentUser) { showPage('account'); return; }
  const data = await api(`/properties?owner_id=${currentUser.id}&limit=100`);
  const items = data.properties;
  document.getElementById('myListings').innerHTML = items.length ? items.map(p => `
    <div class="my-row">
      <img src="${safe(p.images?.[0]?.storage_path || '')}" alt="">
      <div class="row-main">
        <b>${safe(p.title)}</b>
        <small>${money(p.price)} · ${safe(p.city)} · ${t(p.status) || p.status}</small>
      </div>
      <div class="row-actions">
        ${p.status === 'active' ? `<button class="mini-btn" onclick="changeStatus('${p.id}','paused')">${t('pause')}</button>` : `<button class="mini-btn approve" onclick="changeStatus('${p.id}','active')">${t('activate')}</button>`}
        <button class="mini-btn" onclick="editListing('${p.id}')">${t('edit')}</button>
        <button class="mini-btn danger" onclick="deleteListing('${p.id}')">${t('delete')}</button>
      </div>
    </div>
  `).join('') : `<div class="empty-state"><h3>${t('noMine')}</h3><button class="primary" onclick="showPage('post')">${t('postProperty')}</button></div>`;
}

async function changeStatus(id, status) {
  await changePropertyStatus(id, status);
  renderMyListings();
  toast(status === 'active' ? t('listingRestored') : t('listingHidden'));
}

async function deleteListing(id) {
  if (!confirm(t('confirmDelete'))) return;
  await deleteProperty(id);
  renderMyListings();
  toast(t('listingHidden'));
}

async function editListing(id) {
  const p = await loadProperty(id);
  if (!p || p.owner_id !== currentUser?.id) return;
  showPage('post');
  document.getElementById('pTitle').value = p.title;
  document.getElementById('pDescription').value = p.description || '';
  document.getElementById('pType').value = p.property_type;
  document.getElementById('pPrice').value = p.price;
  document.getElementById('pLocation').value = p.city;
  document.getElementById('pBeds').value = p.bedrooms || '';
  document.getElementById('pBaths').value = p.bathrooms || '';
  document.getElementById('pArea').value = p.floor_area || '';
  document.getElementById('pPhone').value = p.contact_phone;
  document.getElementById('pTelegram').value = p.telegram || '';
  postMode = p.listing_type;
  document.getElementById('postForm').dataset.editId = id;
  document.querySelectorAll('[data-postmode]').forEach(x => x.classList.toggle('active', x.dataset.postmode === postMode));
}

// ==================== SAVED ====================
async function renderSaved() {
  if (!currentUser) { showPage('account'); return; }
  await loadFavorites();
  const items = favorites;
  document.getElementById('savedListings').innerHTML = items.length ? items.map(cardHTML).join('') :
    `<div class="empty-state"><h3>${t('noSaved')}</h3><button class="primary" onclick="showPage('home')">${t('search')}</button></div>`;
}

// ==================== ADMIN ====================
async function renderAdmin() {
  if (!currentUser || currentUser.role !== 'admin') { showPage('account'); return; }
  const stats = await api('/admin/stats');
  document.getElementById('adminStats').innerHTML = [
    [t('totalListings'), stats.stats.totalListings],
    [t('activeListings'), stats.stats.activeListings],
    [t('totalUsers'), stats.stats.totalUsers],
    [t('openReports'), stats.stats.openReports],
  ].map(s => `<div class="stat"><span>${s[0]}</span><b>${s[1]}</b></div>`).join('');
  renderAdminTab();
}

async function renderAdminTab() {
  const el = document.getElementById('adminContent');
  if (currentAdminTab === 'listings') {
    const data = await api('/admin/listings');
    el.innerHTML = data.listings.map(p => `
      <div class="admin-row">
        <div class="row-main">
          <b>${safe(p.title)}</b>
          <small>${money(p.price)} · ${safe(p.city)} · ${safe(p.status)} · ${safe(p.owner_name)}</small>
        </div>
        <div class="row-actions">
          ${p.status === 'active' ? `<button class="mini-btn danger" onclick="adminStatus('${p.id}','paused')">${t('hideListing')}</button>` : `<button class="mini-btn approve" onclick="adminStatus('${p.id}','active')">${t('restoreListing')}</button>`}
          <button class="mini-btn" onclick="openDetail('${p.id}')">${t('viewProperty')}</button>
        </div>
      </div>
    `).join('') || '<p>No listings.</p>';
  } else if (currentAdminTab === 'reports') {
    const data = await api('/admin/reports');
    el.innerHTML = data.reports.length ? data.reports.map(r => {
      return `<div class="admin-row">
        <div class="row-main">
          <b>${safe(r.property_title || 'Deleted property')}</b>
          <small>${safe(r.reason)} · ${new Date(r.created_at * 1000).toLocaleDateString()}</small>
        </div>
        <div class="row-actions">
          <button class="mini-btn danger" onclick="adminRemoveListing('${r.property_id}');adminResolveReport('${r.id}')">${t('removeListing')}</button>
          <button class="mini-btn approve" onclick="adminResolveReport('${r.id}')">${t('dismissReport')}</button>
        </div>
      </div>`;
    }).join('') : `<p>${t('noReports')}</p>`;
  } else {
    const data = await api('/admin/users');
    el.innerHTML = data.users.map(u => `
      <div class="admin-row">
        <div class="row-main">
          <b>${safe(u.name)}</b>
          <small>${safe(u.email)} · ${safe(u.phone)} · ${safe(u.role)} · ${safe(u.status)}</small>
        </div>
        <div class="row-actions">
          <button class="mini-btn danger" onclick="suspendUser('${u.id}')">${t('userSuspended')}</button>
        </div>
      </div>
    `).join('') || `<p>${t('noUsers')}</p>`;
  }
}

async function adminStatus(id, status) {
  await api(`/admin/listings/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
  renderAdmin();
  toast(status === 'active' ? t('listingRestored') : t('listingHidden'));
}

async function adminResolveReport(id) {
  await api(`/admin/reports/${id}/resolve`, { method: 'PUT' });
  renderAdmin();
}

async function adminRemoveListing(id) {
  await api(`/admin/listings/${id}/status`, { method: 'PUT', body: JSON.stringify({ status: 'removed' }) });
  renderAdmin();
}

async function suspendUser(id) {
  await api(`/admin/users/${id}/status`, { method: 'PUT', body: JSON.stringify({ status: 'suspended' }) });
  renderAdmin();
  toast(t('userSuspended'));
}

// ==================== EVENT LISTENERS ====================
document.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => {
  mode = b.dataset.mode;
  document.querySelectorAll('[data-mode]').forEach(x => x.classList.toggle('active', x === b));
  renderListings();
}));

document.querySelectorAll('[data-postmode]').forEach(b => b.addEventListener('click', () => {
  postMode = b.dataset.postmode;
  document.querySelectorAll('[data-postmode]').forEach(x => x.classList.toggle('active', x === b));
}));

document.querySelectorAll('[data-admin-tab]').forEach(b => b.addEventListener('click', () => {
  currentAdminTab = b.dataset.adminTab;
  document.querySelectorAll('[data-admin-tab]').forEach(x => x.classList.toggle('active', x === b));
  renderAdminTab();
}));

// Auth form toggle
document.getElementById('authToggle').addEventListener('click', (e) => {
  e.preventDefault();
  const isLogin = document.getElementById('authFormMode').value === 'login';
  const newMode = isLogin ? 'signup' : 'login';
  document.getElementById('authFormMode').value = newMode;
  document.getElementById('authNameField').style.display = isLogin ? 'block' : 'none';
  document.getElementById('authPhoneField').style.display = isLogin ? 'block' : 'none';
  document.getElementById('authRoleField').style.display = isLogin ? 'block' : 'none';
  document.getElementById('authConfirmField').style.display = isLogin ? 'block' : 'none';
  document.getElementById('authBtnText').textContent = isLogin ? 'Sign up' : 'Sign in';
  document.getElementById('authToggleText').textContent = isLogin ? 'Already have an account?' : "Don't have an account?";
  document.getElementById('authToggle').textContent = isLogin ? 'Sign in' : 'Sign up';
  // Reset password strength
  document.getElementById('passwordStrength').style.display = 'none';
  document.getElementById('strengthFill').className = 'strength-fill';
  document.getElementById('strengthFill').style.width = '0';
  document.getElementById('strengthText').textContent = '';
});

// Password toggle
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  btn.innerHTML = isPassword
    ? '<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24\"/><line x1=\"1\" y1=\"1\" x2=\"23\" y2=\"23\"/></svg>'
    : '<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/></svg>';
  btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
}

// Password strength checker
function checkPasswordStrength(password) {
  const strengthEl = document.getElementById('passwordStrength');
  const fillEl = document.getElementById('strengthFill');
  const textEl = document.getElementById('strengthText');

  if (!password) {
    strengthEl.style.display = 'none';
    return;
  }

  strengthEl.style.display = 'block';
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  fillEl.className = 'strength-fill';
  if (strength <= 2) {
    fillEl.classList.add('weak');
    textEl.className = 'strength-text weak';
    textEl.textContent = 'Weak password';
  } else if (strength <= 3) {
    fillEl.classList.add('medium');
    textEl.className = 'strength-text medium';
    textEl.textContent = 'Medium strength';
  } else {
    fillEl.classList.add('strong');
    textEl.className = 'strength-text strong';
    textEl.textContent = 'Strong password';
  }
}

// Role card selection
function selectRole(role) {
  document.getElementById('authRole').value = role;
  document.querySelectorAll('.role-card').forEach(card => {
    card.classList.toggle('active', card.dataset.role === role);
  });
}

// Password strength listener
document.getElementById('authPassword').addEventListener('input', (e) => {
  checkPasswordStrength(e.target.value);
});

// Form validation
function validateAuthForm(isLogin) {
  let valid = true;
  const email = document.getElementById('authEmail');
  const password = document.getElementById('authPassword');

  // Reset errors
  email.classList.remove('error');
  password.classList.remove('error');

  if (!email.value.trim() || !email.value.includes('@')) {
    email.classList.add('error');
    valid = false;
  }
  if (!password.value || password.value.length < 6) {
    password.classList.add('error');
    valid = false;
  }

  if (!isLogin) {
    const name = document.getElementById('authName');
    const phone = document.getElementById('authPhone');
    const confirm = document.getElementById('authConfirm');

    name.classList.remove('error');
    phone.classList.remove('error');
    confirm.classList.remove('error');

    if (!name.value.trim()) { name.classList.add('error'); valid = false; }
    if (!phone.value.trim()) { phone.classList.add('error'); valid = false; }
    if (confirm.value !== password.value) { confirm.classList.add('error'); valid = false; }
  }

  return valid;
}

document.getElementById('authForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const isLogin = document.getElementById('authFormMode').value === 'login';

  if (!validateAuthForm(isLogin)) {
    toast('Please fix the errors above', true);
    return;
  }

  try {
    if (isLogin) {
      const email = document.getElementById('authEmail').value.trim();
      const password = document.getElementById('authPassword').value;
      await login(email, password);
      toast(t('loginSuccess'));
      showPage('home');
    } else {
      const name = document.getElementById('authName').value.trim();
      const email = document.getElementById('authEmail').value.trim();
      const phone = document.getElementById('authPhone').value.trim();
      const password = document.getElementById('authPassword').value;
      const confirm = document.getElementById('authConfirm').value;
      const role = document.getElementById('authRole').value;
      if (password !== confirm) { toast('Passwords do not match', true); return; }
      const data = await signup(name, email, phone, password, role);
      toast(t('otpSent'));
      // Show OTP verification
      const otp = prompt(t('otpSent') + '\n' + (data.devOtp || ''));
      if (otp) {
        await verifyOTP(data.userId, otp);
        toast(t('loginSuccess'));
        showPage('home');
      }
    }
  } catch (e) {
    toast(e.message || t('error'), true);
  }
});

// Post form
document.getElementById('postForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentUser) { toast(t('needAccount'), true); return; }

  const title = document.getElementById('pTitle').value.trim();
  const price = Number(document.getElementById('pPrice').value);
  const city = document.getElementById('pLocation').value.trim();
  const phone = document.getElementById('pPhone').value.trim();

  if (!title || price <= 0 || !city || !phone || !document.getElementById('pConfirm').checked) {
    toast('Please complete all required fields.', true);
    return;
  }

  // Upload images
  const files = [...document.getElementById('pPhotos').files].slice(0, 5);
  const images = [];
  for (const file of files) {
    if (file.size > 5 * 1024 * 1024) { toast('Each photo must be under 5 MB.', true); return; }
    try {
      const result = await uploadImage(file);
      images.push(result.key);
    } catch (e) {
      toast('Upload failed: ' + e.message, true);
      return;
    }
  }

  const editId = e.target.dataset.editId;
  const formData = {
    title,
    description: document.getElementById('pDescription').value.trim(),
    property_type: document.getElementById('pType').value,
    listing_type: postMode,
    price,
    city,
    bedrooms: Number(document.getElementById('pBeds').value) || 0,
    bathrooms: Number(document.getElementById('pBaths').value) || 0,
    floor_area: Number(document.getElementById('pArea').value) || 0,
    contact_phone: phone,
    telegram: document.getElementById('pTelegram').value.trim(),
    images,
  };

  try {
    if (editId) {
      await updateProperty(editId, formData);
    } else {
      await createProperty(formData);
    }
    e.target.reset();
    delete e.target.dataset.editId;
    postMode = 'sale';
    document.querySelectorAll('[data-postmode]').forEach(x => x.classList.toggle('active', x.dataset.postmode === 'sale'));
    toast(t('listingPublished'));
    showPage('home');
    loadProperties();
  } catch (e) {
    toast(e.message || t('error'), true);
  }
});

// Language
document.getElementById('language').addEventListener('change', () => {
  document.documentElement.lang = document.getElementById('language').value;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t(key)) el.textContent = t(key);
  });
  renderListings();
  if (currentUser) renderAccount();
});

// Service worker
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

// Install prompt
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  installPrompt = e;
  document.getElementById('installBtn').hidden = false;
});

document.getElementById('installBtn').addEventListener('click', async () => {
  if (!installPrompt) return;
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  document.getElementById('installBtn').hidden = true;
});

// Hash routing
window.addEventListener('hashchange', () => {
  const id = location.hash.match(/property=(.+)/)?.[1];
  if (id) openDetail(decodeURIComponent(id));
});

// ==================== INIT ====================
document.getElementById('year').textContent = new Date().getFullYear();
updateAuthUI();
document.documentElement.lang = 'en';
checkAuth();
loadProperties();
if (location.hash.includes('property=')) {
  const id = decodeURIComponent(location.hash.split('property=')[1]);
  openDetail(id);
}
