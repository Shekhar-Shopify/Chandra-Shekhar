document.addEventListener('DOMContentLoaded', ()=> {
    document.addEventListener('click', openQuickView);
    document.addEventListener('click', modalCLose);
    document.addEventListener('click', OpenvariantDropdown);
    document.addEventListener('click', updateSelectedSize);
    document.addEventListener('click', updateSelectedVariant);
    document.addEventListener('submit', addQuickViewToCart);
});

// Fetches a product's markup and opens the quick view modal
async function openQuickView(e) {
    const QuickView = e.target.closest('.quick_view_btn');
    if (!QuickView) return;
    const productHandle = QuickView.dataset.productHandle;
    if (!productHandle) return;
    const modal = document.getElementById('QuickViewModal');
    if (!modal) return;
    const body = document.body;
    try {
        const response = await fetch(`/products/${productHandle}?section_id=custom-quick-view`);
        const html = await response.text();
        modal.querySelector('.QuickViewModal__product-content').innerHTML = html;
        modal.classList.remove('hidden');
        body.classList.add('overflow-hidden');
    } catch (error) {
        console.error('Error fetching product data:', error);
    }
}

// Closes the quick view modal when the close button is clicked
function modalCLose(e) {
    closeButton = e.target.closest('.QuickViewModal__close');
    if (closeButton) {
        const modal = document.getElementById('QuickViewModal');
        const body = document.querySelector('body');
        modal.classList.add('hidden');
        body.classList.remove('overflow-hidden');
    }
}

// Toggles the size dropdown open/closed
function OpenvariantDropdown(e) {
    const button = e.target.closest('.quick-view-option.dropdown .dropdown-btn');
    if (button) {
        const dropdown = button.closest('.quick-view-option.dropdown');
        const dropdownContent = dropdown.querySelector('#quick-view-option-size');
        dropdownContent.classList.toggle('hidden');
    }
}

// Updates the hidden size input and dropdown label when a size option is picked
function updateSelectedSize(e) {
    const button = e.target.closest('.quick-view-option.dropdown .dropdown-btn.option');
    const dropdownLabel = document.querySelector('.select-wrapper>.dropdown-btn .dropdown-text-lable');
    if (button) {
        const input = button.closest('.quick-view-option.dropdown').querySelector('.selected-size-input');
        input.value = button.dataset.value;
        dropdownLabel.textContent = button.dataset.value;
    }
}

// Resolves the matching product variant from the selected color/size and stores its ID
function updateSelectedVariant(e) {
    const button = e.target.closest('.quick-view-option.dropdown .dropdown-btn.option');
    const colorRadio = e.target.closest('.quick-view-option.radio input[type="radio"]');
    if (!button && !colorRadio) return;

    const modal = document.getElementById('QuickViewModal');
    if (!modal) return;

    const productDataElement = modal.querySelector('.quick-view-product-json');
    if (!productDataElement) {
        console.log('Product JSON not found');
        return;
    }

    let productData;
    try {
        productData = JSON.parse(productDataElement.textContent.trim());
    } catch (error) {
        console.error('Product JSON error:', error);
        console.log('JSON content:', productDataElement.textContent);
        return;
    }

    let selectedSize = '';
    if (button) {
        selectedSize = button.dataset.value.trim();

        const sizeInput = modal.querySelector('.selected-size-input');
        if (sizeInput) {
            sizeInput.value = selectedSize;
        }

        const dropdown = button.closest('.quick-view-option.dropdown');
        if (dropdown) {
            const label = dropdown.querySelector('.dropdown-text-lable');
            if (label) {
                label.textContent = selectedSize;
            }

            const dropdownContent = dropdown.querySelector('#quick-view-option-size');
            if (dropdownContent) {
                dropdownContent.classList.add('hidden');
            }
        }
    } else {
        // Color changed — reuse the already-selected size, if any.
        const sizeInput = modal.querySelector('.selected-size-input');
        selectedSize = sizeInput ? sizeInput.value.trim() : '';
    }

    const selectedColor = modal.querySelector('.quick-view-option.radio input[type="radio"]:checked');
    const colorValue = selectedColor ? selectedColor.value.trim() : '';

    console.log('Selected Color:', colorValue);
    console.log('Selected Size:', selectedSize);

    const colorIndex = productData.options.findIndex(option => option.toLowerCase() === 'color');
    const sizeIndex = productData.options.findIndex(option => option.toLowerCase() === 'size');

    console.log('Color index:', colorIndex);
    console.log('Size index:', sizeIndex);

    const selectedVariant = productData.variants.find(variant => {
        const colorMatches = colorIndex === -1 || variant.options[colorIndex] === colorValue;
        const sizeMatches = sizeIndex === -1 || variant.options[sizeIndex] === selectedSize;
        return colorMatches && sizeMatches;
    });

    const variantIdInput = modal.querySelector('.selected-variant-id');
    if (!variantIdInput) {
        console.log('Variant ID input not found');
        return;
    }

    if (selectedVariant) {
        variantIdInput.value = selectedVariant.id;
        console.log('CORRECT MAIN PRODUCT VARIANT:', selectedVariant.id);
        console.log('Variant:', selectedVariant);
    } else {
        variantIdInput.value = '';
        console.log('Variant not found');
    }
}

// Adds the selected variant to the cart and refreshes the cart drawer/notification
async function addQuickViewToCart(e) {
    const form = e.target.closest('.quick-view-form');
    if (!form) return;
    e.preventDefault();

    const variantInput = form.querySelector('.selected-variant-id');
    if (!variantInput || !variantInput.value) {
        console.log('Variant ID missing');
        return;
    }
    const variantId = Number(variantInput.value);

    const selectedColor = form.querySelector('.quick-view-option.radio input[type="radio"]:checked');
    const color = selectedColor ? selectedColor.value.trim() : '';

    const selectedSizeInput = form.querySelector('.selected-size-input');
    const size = selectedSizeInput ? selectedSizeInput.value.trim() : '';

    console.log('Adding variant:', variantId);
    console.log('Selected Color:', color);
    console.log('Selected Size:', size);

    const items = [
        {
            id: variantId,
            quantity: 1
        }
    ];

    if (color.toLowerCase() === 'black' && size.toLowerCase() === 'm') {
        console.log('Black + Medium detected');

        try {
            const jacketResponse = await fetch('/products/dark-winter-jacket.js');
            if (!jacketResponse.ok) {
                throw new Error('Soft Winter Jacket product not found');
            }

            const jacketProduct = await jacketResponse.json();
            const jacketVariant = jacketProduct.variants.find(variant => variant.available);
            if (!jacketVariant) {
                throw new Error('Soft Winter Jacket is unavailable');
            }

            console.log('Soft Winter Jacket variant:', jacketVariant.id);

            items.push({
                id: Number(jacketVariant.id),
                quantity: 1
            });
        } catch (error) {
            console.error('Unable to get Soft Winter Jacket:', error);
        }
    }

    console.log('Items being added:', items);

    try {
        const cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
        const sectionsToRender = cart ? cart.getSectionsToRender().map(section => section.id) : [];

        const addResponse = await fetch('/cart/add.js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                items: items,
                sections: sectionsToRender,
                sections_url: window.location.pathname
            })
        });

        const addData = await addResponse.json();
        if (!addResponse.ok) {
            throw new Error(addData.description || 'Add to cart failed');
        }

        console.log('Added to cart:', addData);
        if (addData.items && addData.items.length) {
            addData.key = addData.items[0].key;
        }

        if (cart) {
            cart.renderContents(addData);
            console.log('Cart notification updated + opened');
        } else {
            console.log('cart-notification / cart-drawer element not found');
        }

        const modal = document.getElementById('QuickViewModal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        }
    } catch (error) {
        console.error('Add to cart error:', error);
    }
}

// Fetches the Soft Winter Jacket product and returns its first available variant ID
async function getSoftWinterJacketVariant() {
    const response = await fetch('/products/dark-winter-jacket.js');
    if (!response.ok) {
        throw new Error('Soft Winter Jacket product not found');
    }

    const product = await response.json();
    const variant = product.variants.find(variant => variant.available);
    if (!variant) {
        throw new Error('Soft Winter Jacket is unavailable');
    }

    return variant.id;
}
