document.addEventListener('DOMContentLoaded', ()=> {
    document.addEventListener('click', openQuickView);
    document.addEventListener('click', modalCLose);
    document.addEventListener('click', OpenvariantDropdown);
    document.addEventListener('click', updateSelectedSize);
    document.addEventListener('click', updateSelectedVariantId);
});
// Function to open the quick view modal and fetch product data
async function openQuickView(e){
   const QuickView = e.target.closest('.quick_view_btn');
   const productHabnndle = QuickView.dataset.productHandle;
   const modal = document.getElementById('QuickViewModal');
   const body = document.querySelector('body');
   try {
     const response = await fetch(`/products/${productHabnndle}?section_id=custom-quick-view`);
        const html = await response.text();
        modal.querySelector('.QuickViewModal__product-content').innerHTML = html;
        modal.classList.remove('hidden');
        body.classList.add('overflow-hidden');    
    }
    catch (error) {
        console.error('Error fetching product data:', error);
    }
 };
 // Close the modal when the close button is clicked
 function modalCLose(e){
    closeButton = e.target.closest('.QuickViewModal__close');
    if(closeButton){
        const modal = document.getElementById('QuickViewModal');
        const body = document.querySelector('body');
        modal.classList.add('hidden');
        body.classList.remove('overflow-hidden');
    }
 }
 // Toggle the visibility of the size dropdown when the dropdown button is clicked
 function OpenvariantDropdown(e){
    const button = e.target.closest('.quick-view-option.dropdown .dropdown-btn');
    if(button){
        const dropdown = button.closest('.quick-view-option.dropdown');
        const dropdownContent = dropdown.querySelector('#quick-view-option-size');
        dropdownContent.classList.toggle('hidden');
    }
 };
 // Update the selected size in the hidden input field and dropdown label
 function updateSelectedSize(e){
    const button = e.target.closest('.quick-view-option.dropdown .dropdown-btn.option');
    const dropdownLabel = document.querySelector('.select-wrapper>.dropdown-btn');
    if(button){
        const input = button.closest('.quick-view-option.dropdown').querySelector('.selected-size-input');
        input.value = button.dataset.value;
        dropdownLabel.textContent = button.dataset.value;
    }
 }
 // Update the selected variant ID in the hidden input field when a size is selected
function updateSelectedVariantId(e) {

    const button = e.target.closest(
        '.quick-view-option.dropdown .dropdown-btn.option'
    );

    if (!button) return;

    const productDataElement = document.querySelector(
        '.quick-view-product-json'
    );

    if (!productDataElement) return;

    const productData = JSON.parse(
        productDataElement.textContent
    );

    const selectedSize = button.dataset.value;

    const selectedColor = document.querySelector(
        '.quick-view-option.radio input[type="radio"]:checked'
    );

    const colorValue = selectedColor
        ? selectedColor.value
        : '';

    const selectedVariant = productData.variants.find(
        variant =>
            variant.option1 === colorValue &&
            variant.option2 === selectedSize
    );

    const variantIdInput = document.querySelector(
        '.selected-variant-id'
    );

    if (selectedVariant) {

        variantIdInput.value = selectedVariant.id;

        console.log('Color:', colorValue);
        console.log('Size:', selectedSize);
        console.log('Variant ID:', selectedVariant.id);

    } else {

        variantIdInput.value = '';

        console.log('Variant not found');

    }
}