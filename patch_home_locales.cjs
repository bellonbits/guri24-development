const fs = require('fs');

const enPath = '/home/gatitu/guri24-development/src/i18n/locales/en.json';
const soPath = '/home/gatitu/guri24-development/src/i18n/locales/so.json';

const enUpdates = {
    home: {
        hero_badge: "East Africa's #1 Real Estate Platform",
        hero_title_p1: "Find Your Dream Home",
        hero_title_p2: "with Guri24",
        hero_subtitle: "Thousands of verified properties across Kenya & East Africa",
        stats_exp: "Years Experience",
        stats_clients: "Happy Clients",
        stats_props: "Properties",
        stats_about_title: "Your trusted partner for smarter real estate decisions",
        stats_about_desc: "Our experienced agents blend deep market insight, modern technology, and personalized service to deliver transparent guidance, strong results, and long-term value across East Africa.",
        learn_more: "Learn more about us →"
    },
    filter: {
        short_stay: "Short Stay",
        location: "Location",
        where_going: "Where are you going?",
        type: "Type",
        all_types: "All Types",
        price_range: "Price Range",
        any_price: "Any Price",
        under_10m: "Under KES 10M",
        under_50m: "Under KES 50M",
        under_100m: "Under KES 100M",
        above_100m: "KES 100M+",
        search: "Search"
    }
};

const soUpdates = {
    home: {
        hero_badge: "Platformka 1aad ee Guryaha Barriga Afrika",
        hero_title_p1: "Hel Guriga Aad Ku Riyooneyso",
        hero_title_p2: "Guri24",
        hero_subtitle: "Kumanaan guryo la xaqiijiyay oo ku yaal Kenya & Barriga Afrika",
        stats_exp: "Sanooyin Khibrad Ah",
        stats_clients: "Macaamiil Faraxsan",
        stats_props: "Guryo",
        stats_about_title: "Lammaanahaaga lagu kalsoon yahay ee go'aanada caqliga leh",
        stats_about_desc: "Wakiiladayada khibradda leh waxay isku daraan faham qoto dheer oo suuqa ah, tignoolajiyada casriga ah, iyo adeeg shakhsi ahaaneed si ay u bixiyaan hagitaan daah furan, natiijooyin adag, iyo qiimo mustaqbalka fog ah guud ahaan Bariga Afrika.",
        learn_more: "Naga baro wax badan →"
    },
    filter: {
        short_stay: "Ijaar Gaaban",
        location: "Goobta",
        where_going: "Xageed u socotaa?",
        type: "Nooca",
        all_types: "Dhammaan Noocyada",
        price_range: "Qiimaha",
        any_price: "Qiimo Kasta",
        under_10m: "Ka Yar KES 10M",
        under_50m: "Ka Yar KES 50M",
        under_100m: "Ka Yar KES 100M",
        above_100m: "KES 100M+",
        search: "Raadi"
    }
};

const updateFile = (path, updates) => {
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));
    
    if (!data.home) data.home = {};
    Object.assign(data.home, updates.home);

    if (!data.filter) data.filter = {};
    Object.assign(data.filter, updates.filter);

    fs.writeFileSync(path, JSON.stringify(data, null, 4));
};

updateFile(enPath, enUpdates);
updateFile(soPath, soUpdates);
console.log('Successfully patched front page string locales');
