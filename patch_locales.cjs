const fs = require('fs');

const enPath = '/home/gatitu/guri24-development/src/i18n/locales/en.json';
const soPath = '/home/gatitu/guri24-development/src/i18n/locales/so.json';

const enVars = {
    sell: {
        title: "List Your Property",
        subtitle: "Listing your property for sale or rent doesn't have to be complicated. Let Guri24's experts help you get the maximum value with zero stress.",
        why_list: "Why List With Guri24?",
        benefit_1_title: "Verified Buyers",
        benefit_1_desc: "We connect you with pre-qualified, serious buyers ready to make offers.",
        benefit_2_title: "Best Price",
        benefit_2_desc: "Our market analysis ensures your property is priced competitively for maximum returns.",
        benefit_3_title: "Full Support",
        benefit_3_desc: "From listing to closing, we handle all paperwork and negotiations for you.",
        ready_title: "Ready to List Your Property?",
        ready_desc: "Please log in or create an account to start the listing process with Guri24.",
        login_btn: "Log In",
        create_account_btn: "Create Account",
        form_title: "List Your Property",
        form_desc: "Fill out the form and one of our experts will contact you within 24 hours to discuss your property listing.",
        need_help: "Need assistance?",
        name_label: "Your Name",
        email_label: "Email Address",
        phone_label: "Phone Number",
        type_label: "Property Type",
        location_label: "Property Location",
        desc_label: "Property Description",
        submit_btn: "Submit Property",
        success_msg: "Thank you! Our team will contact you shortly.",
        placeholder_name: "John Doe",
        placeholder_email: "john@example.com",
        placeholder_phone: "+254 7XX XXX XXX",
        placeholder_type: "Select type",
        placeholder_location: "e.g., Westlands, Nairobi",
        placeholder_desc: "Describe your property details..."
    },
    agent_profile: {
        quick_info: "Quick Info",
        account_status: "Account Status",
        email_verified: "Email Verified",
        profile_completion: "Profile Completion",
        upload_docs: "Click to upload documents",
        uploading: "Uploading documents...",
        verification_success: "You are Verified!",
        verification_success_desc: "Your account is fully verified. Your listings now show the verification badge.",
        verification_pending: "Verification Pending",
        verification_pending_desc: "Your documents are being reviewed. This usually takes 24-48 hours.",
        verification_rejected: "Verification Rejected",
        verification_rejected_desc: "Please upload new documents to try again.",
        submitted_docs: "Submitted Documents",
        view_doc: "View Document",
        delete_doc: "Delete Document",
        no_docs: "No documents uploaded.",
        admin_info_desc: "Update user's personal details and contact information",
        admin_prof_desc: "User's professional background and expertise",
        admin_docs_desc: "Documents submitted for agent verification",
        account_type: "Account Type"
    }
};

const soVars = {
    sell: {
        title: "Diiwaangeli Gurigaaga",
        subtitle: "Inaad iibiso ama kireyso gurigaaga ma aha wax dhib badan. Khubarada Guri24 ayaa kaa caawinaya inaad hesho qiimaha ugu fiican adigoon is dhibin.",
        why_list: "Maxaad Liiska Guri24 u Dooranaysaa?",
        benefit_1_title: "Iibsadayaal La Xaqiijiyay",
        benefit_1_desc: "Waxaan kugu xireynaa dad si dhab ah wax u iibsanaya oo diyaar u ah.",
        benefit_2_title: "Qiimaha Ugu Fiican",
        benefit_2_desc: "Falanqayntayada suuqa waxay xaqiijinaysaa in gurigaaga lagu iibiyo qiimaha ugu badan.",
        benefit_3_title: "Taageero Buuxda",
        benefit_3_desc: "Laga soo bilaabo diiwaangelinta ilaa xiritaanka, waxaan gacan ku haynaa dhammaan waraaqaha iyo gorgortanka.",
        ready_title: "Ma diyaar baa inaad diiwaangeliso?",
        ready_desc: "Fadlan soo gal ama sameyso akoon si aad ugu bilowdo diiwaangelinta Guri24.",
        login_btn: "Soo Gal",
        create_account_btn: "Sameyso Account",
        form_title: "Diiwaangeli Gurigaaga",
        form_desc: "Buuxi foomka, mid ka mid ah khubaradayada ayaana kugula soo xiriiri doona 24 saac gudahood.",
        need_help: "Ma u baahantahay caawimaad?",
        name_label: "Magacaaga",
        email_label: "Iimeelkaaga",
        phone_label: "Telefoonkaaga",
        type_label: "Nooca Guriga",
        location_label: "Goobta Guriga",
        desc_label: "Faahfaahinta Guriga",
        submit_btn: "Gudbi Guriga",
        success_msg: "Waad mahadsantahay! Kooxdayada ayaa ku soo wici doonta dhowaan.",
        placeholder_name: "Tusaale, Cali Axmed",
        placeholder_email: "cali@example.com",
        placeholder_phone: "+254 7XX XXX XXX",
        placeholder_type: "Dooro nooca",
        placeholder_location: "Tusaale, Westlands, Nairobi",
        placeholder_desc: "Sharaxaad ka bixi gurigaaga..."
    },
    agent_profile: {
        quick_info: "Xog Dhaqso ah",
        account_status: "Heerka Account-ka",
        email_verified: "Iimeelka Waa La Xaqiijiyay",
        profile_completion: "Dhamaystirka Profile-ka",
        upload_docs: "Riix si aad u rogto dukumiintiyo",
        uploading: "Dukumiintiyo ayaa la rogayaa...",
        verification_success: "Waad Xaqiijisan Tahay!",
        verification_success_desc: "Account-kaaga si buuxda ayaa loo xaqiijiyay. Guryahaaga hadda waxay leeyihiin calaamadda xaqiijinta.",
        verification_pending: "Xaqiijinta Waa Sugitaan",
        verification_pending_desc: "Dukumiintiyadaada ayaa la fiirinayaa. Waxay qaadataa inta badan 24-48 saac.",
        verification_rejected: "Xaqiijinta Waa La Diiday",
        verification_rejected_desc: "Fadlan rogo dukumiintiyo cusub si aad mar kale isugu daydo.",
        submitted_docs: "Dukumiintiyada La Gudbiyay",
        view_doc: "Fiiri Dukumiintiga",
        delete_doc: "Tirtir Dukumiintiga",
        no_docs: "Wax dukumiinti ah lama rarin.",
        admin_info_desc: "Cusbooneysii xogta shakhsiga ah",
        admin_prof_desc: "Aqoonsiga xirfadeed ee isticmaalaha",
        admin_docs_desc: "Dukumiintiyada la gudbiyay ee xaqiijinta wakiilka",
        account_type: "Nooca Account-ka"
    }
};

const updateFile = (path, vars) => {
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));
    data.sell = vars.sell;
    data.agent_profile = vars.agent_profile;
    fs.writeFileSync(path, JSON.stringify(data, null, 4));
};

updateFile(enPath, enVars);
updateFile(soPath, soVars);
console.log('Successfully updated locales');
