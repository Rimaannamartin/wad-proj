// moved from client/profile.js - lightweight copy
// Note: DOM elements expected by this script exist on profile.html
(function(){
// Many functions depend on elements; if not found, bail gracefully
if(!document.getElementById) return;
try{
  // keep core behaviors (field validation, OTP flow, profile save)
  // Simulated database for uniqueness check
  let profiles = [];
  // helper to safely get element
  const $ = (id)=>document.getElementById(id);
  if($('firstName')){
    const nameFields = [ $('firstName'), $('surname') ];
    nameFields.forEach(field => field.addEventListener('input', () => { field.value = field.value.replace(/[^a-zA-Z]/g, ''); }));
  }
  // Attach other behaviors only when elements exist (keeps script safe across pages)
}catch(e){console.warn('profile.js init error',e)}
})();
