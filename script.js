let order = [];
let deliveryOption = 'pickup'; 

document.addEventListener('DOMContentLoaded', () => {
    loadMenuItems('pizza'); 
});

async function fetchMenuItems() {
    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbyj0KOB7_W-hH3MwDFCb70HLS_fkMlG8EybCIkO2r6o3_Oe1iNOYDhEBIWORKCTSx2k/exec');   
        
        if (!response.ok) {
            throw new Error('Error al obtener los productos desde la API');
        }

        const data = await response.json();

        // Ahora, accedemos a los elementos de productos a través de data
        if (!data || !data.data || !Array.isArray(data.data)) {
            throw new Error('Datos inválidos recibidos de la API');
        }

        return data.data;  // Cambiado para retornar el array de productos
    } catch (error) {
        console.error('Error al cargar los productos:', error);
        document.getElementById('menu-items').innerHTML = `<p>Error al cargar los productos: ${error.message}</p>`;
        return []; // Devolver una lista vacía para evitar errores
    }
}

async function loadMenuItems(category) {
    const loadingElement = document.getElementById('loading');
    loadingElement.style.display = 'block'; // Mostrar el spinner

    try {
        const menuItems = await fetchMenuItems(); 
        renderMenuItems(menuItems, category);
    } catch (error) {
        console.error('Error al cargar los productos:', error);
    } finally {
        loadingElement.style.display = 'none'; // Ocultar el spinner al finalizar
    }
}

function renderMenuItems(menuItems, category) {
    const menuItemsContainer = document.getElementById('menu-items');
    menuItemsContainer.innerHTML = ''; 

    // Filtra los elementos basados en la categoría seleccionada
    const filteredItems = menuItems.filter(item => item.category === category);
    
    // Si no hay elementos, muestra un mensaje
    if (filteredItems.length === 0) {
        menuItemsContainer.innerHTML = `<p>No hay productos disponibles en esta categoría</p>`;
        return;
    }

    // Renderiza los productos filtrados
    filteredItems.forEach(item => {   
        const itemElement = document.createElement('div');
        itemElement.className = 'item';
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>$${item.price.toFixed(2)}</p>
            <p>${item.availableDescription}</p>
            <button class="add-btn" onclick="addToOrder('${item.name}', ${item.price})">Agregar</button>
        `;
        menuItemsContainer.appendChild(itemElement);
    });
}

function filterCategory(category) {
    loadMenuItems(category); // Cargar productos filtrados de la API
    const categoryButtons = document.querySelectorAll('.category');
    categoryButtons.forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('data-category') === category) {
            button.classList.add('active');
        }
    });
}

function addToOrder(name, price) {
    const existingItem = order.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity++;
        existingItem.totalPrice += price;
    } else {
        order.push({ name, price, quantity: 1, totalPrice: price });
    }

    updateOrderSummary();
}

function removeFromOrder(name) {
    const itemIndex = order.findIndex(item => item.name === name);

    if (itemIndex > -1) {
        if (order[itemIndex].quantity > 1) {
            order[itemIndex].quantity--;
            order[itemIndex].totalPrice -= order[itemIndex].price;
        } else {
            order.splice(itemIndex, 1);
        }
    }

    updateOrderSummary();
}

function updateOrderSummary() {
    const orderItems = document.getElementById('order-items');
    orderItems.innerHTML = '';

    let itemCount = 0;
    let total = 0;

    order.forEach((item, index) => {
        itemCount += item.quantity;
        total += item.totalPrice;

        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <p>${item.name} <span>$${item.totalPrice.toFixed(2)}</span></p>
            <button class="remove-btn" onclick="removeFromOrder('${item.name}')">-</button>
            <span>${item.quantity}</span>
            <button class="add-btn" onclick="addToOrder('${item.name}', ${item.price})">+</button>
        `;
        orderItems.appendChild(orderItem);
    });

    document.getElementById('item-count').textContent = itemCount;
    document.getElementById('item-total').textContent = `$${total.toFixed(2)}`;
    const tax = total * 0.10;
    document.getElementById('tax-amount').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total-amount').textContent = `$${(total + tax).toFixed(2)}`;
}

function setDeliveryOption(option) {
    deliveryOption = option;

    const deliveryButtons = document.querySelectorAll('.delivery-btn');
    deliveryButtons.forEach(button => {
        button.classList.remove('active');
    });

    if (option === 'pickup') {
        document.querySelector('.delivery-btn:nth-child(1)').classList.add('active');
    } else if (option === 'delivery') {
        document.querySelector('.delivery-btn:nth-child(2)').classList.add('active');
    }
}
    
function printBill() {
    const customerName = document.getElementById('customer-name').value;
    const customerPhone = document.getElementById('customer-phone').value;
    const customerAddress = document.getElementById('customer-address').value;

    if (!customerName || !customerPhone || !customerAddress) {
        alert("Por favor, completa la información del cliente.");
        return;
    }

    if (order.length === 0) {
        alert("No hay productos en el pedido para imprimir.");
        return;
    }

    // Formatear los datos como texto plano
    let itemsList = order.map(item => `${item.name}: ${item.totalPrice}`).join(', ');
    let total = order.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2);
    let tax = (total * 0.10).toFixed(2);
    let totalAmount = (total * 1.10).toFixed(2);

    let params = `Nombre: ${customerName}, Teléfono: ${customerPhone}, Dirección: ${customerAddress}, Productos: [${itemsList}], Total: $${total}, Impuesto: $${tax}, Total con Impuesto: $${totalAmount}`;

    fetch('https://script.google.com/macros/s/AKfycbx_Ete5IlNtsYxKizPm0LfhcShbeJ42LkOZzkTQIJ9TPx0uVGckXWLVKPpk4mgYjPVG/exec', {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8' // Cambiado a 'text/plain'
        },
        body: params // Enviar como texto plano
    })
    .then(response => response.text()) // Cambiar a .text() para manejar texto plano
    .then(data => {
        console.log('Success:', data);
        alert("Pedido enviado con éxito");
    })
    .catch((error) => {
        console.error('Error al enviar el pedido:', error);
        alert("Hubo un error al enviar el pedido. Inténtalo de nuevo.");
    });
}





