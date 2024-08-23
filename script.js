const menuItems = [
    { name: 'Pizza de Pepperoni', price: 40000, availableDescription: 'La clasica de toda la vida', category: 'pizza', image: 'Assets/MenuProductos/pizzapeperoni.png' },
    { name: 'Pizza de Queso', price: 40000, availableDescription: 'Muy rica y sabrosa', category: 'pizza', image: 'Assets/MenuProductos/pizzaqueso.png' },
    { name: 'Pizza Vegetariana', price: 35000, availableDescription: 'Only vegetarianos', category: 'pizza', image: 'Assets/MenuProductos/pizzavegetariana.png' },
    { name: 'Pizza Hawaiana', price: 45000, availableDescription: 'La mejor pizza de hawai', category: 'pizza', image: 'Assets/MenuProductos/pizzahawaiana.png' },
    { name: 'Pizza de Pollo BBQ', price: 50000, availableDescription: 'Con pollo bbq', category: 'pizza', image: 'Assets/MenuProductos/pizzabbq.png' },
    { name: 'Pizza de Margherita', price: 70000, availableDescription: 'Una piza italiana', category: 'pizza', image: 'Assets/MenuProductos/pizzamarguerita.png' },
    { name: 'Coca-Cola', price: 5000, availableDescription: 'Una coke', category: 'drinks', image: 'Assets/MenuProductos/cocacola.png' },
    { name: 'Pepsi', price: 10000, availableDescription: 'Peor que la CocaCola', category: 'drinks', image: 'Assets/MenuProductos/pepsi.png' },
    { name: 'Heladito', price: 8000, availableDescription: 'El mejor helado de Colombia', category: 'dessert', image: 'Assets/MenuProductos/helado.png' },
    { name: 'Torta de chocolate', price: 15000, availableDescription: 'Una torta my rica', category: 'dessert', image: 'Assets/MenuProductos/CakeChocolate.png' },
];

let order = [];
let deliveryOption = 'pickup'; 

document.addEventListener('DOMContentLoaded', () => {
    renderMenuItems('pizza'); 
});

function renderMenuItems(category) {
    const menuItemsContainer = document.getElementById('menu-items');
    menuItemsContainer.innerHTML = ''; 

    const filteredItems = menuItems.filter(item => item.category === category);
    
    filteredItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'item';
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>$${item.price.toFixed(2)}</p>
            <p>${item.availableDescription} </p>
            <button class="add-btn" onclick="addToOrder('${item.name}', ${item.price})">Add</button>
        `;
        menuItemsContainer.appendChild(itemElement);
    });
}

function filterCategory(category) {
    renderMenuItems(category);
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
    if (order.length === 0) {
        alert("No hay productos en el pedido para imprimir.");
        return;
    }

    let params = new URLSearchParams();

    order.forEach((item, index) => {
        params.append(`product${index}_name`, item.name);
        params.append(`product${index}_price`, item.price.toFixed(2));
        params.append(`product${index}_quantity`, item.quantity);
        params.append(`product${index}_totalPrice`, item.totalPrice.toFixed(2));
    });

    const total = order.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = total * 0.10;
    const totalAmount = (total + tax).toFixed(2);

    params.append('total', total.toFixed(2));
    params.append('tax', tax.toFixed(2));
    params.append('totalAmount', totalAmount);
    params.append('deliveryOption', deliveryOption);

    window.location.href = `index.html?${params.toString()}`;
}
