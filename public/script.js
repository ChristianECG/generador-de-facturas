let carrito = {
	productos: {},
	total: 0,
	agregarProducto: function (id, nombre, precio) {
		if (this.productos[id]) this.productos[id].cantidad++;
		else
			this.productos[id] = {
				cantidad: 1,
				nombre: nombre,
				precio: precio,
			};
		this.total += parseFloat(precio);

		this.mostrarCarrito();
	},
	incrementarProducto: function (id) {
		this.productos[id].cantidad++;
		this.total += parseFloat(this.productos[id].precio);
		this.mostrarCarrito();
	},
	borrarProducto: function (id) {
		if (this.productos[id]) {
			this.total -=
				this.productos[id].precio * this.productos[id].cantidad;
			delete this.productos[id];
		}
		this.mostrarCarrito();
	},
	reducirCantidad: function (id) {
		if (this.productos[id]) {
			this.total -= this.productos[id].precio;
			this.productos[id].cantidad--;
			if (this.productos[id].cantidad == 0) delete this.productos[id];
		}
		this.mostrarCarrito();
	},
	aplicarDescuento: function () {
		let $code = document.getElementById('code').value;
		let $total = document.getElementById('total');
		if ($code.toLowerCase() == 'platzi30') {
			$total.innerHTML = `$${(this.total * 0.7).toFixed(2)}`;
		} else this.mostrarCarrito();
	},
	guardarCarrito: async function () {
		if (Object.keys(this.productos).length == 0) return;

		await fetch(
			'https://facturas-master-cecg-default-rtdb.firebaseio.com/invoices.json',
			{
				method: 'POST',
				body: JSON.stringify({
					productos: this.productos,
					total: this.total.toFixed(2),
					fecha: new Date(),
				}),
			}
		);

		this.productos = {};
		this.total = 0;
		this.mostrarCarrito();

		document.getElementById('save-data-success').style.display = 'block';
		setTimeout(() => {
			document.getElementById('save-data-success').style.display = 'none';
		}, 3000);
	},
	mostrarCarrito: function () {
		let $carrito = document.getElementById('carrito');
		$carrito.innerHTML = '';
		for (let producto in this.productos) {
			let productoHTML = `
				<section class="producto">
					<p>
						Nombre: <b>${this.productos[producto].nombre}</b><br>
						Cantidad agregada:<b>${this.productos[producto].cantidad}</b><br>
						Precio unitario: <b>$${this.productos[producto].precio}</b><br>
						Total del producto: <b>
							$${(
								this.productos[producto].precio *
								this.productos[producto].cantidad
							).toFixed(2)}
						</b>
					</p>
					<section class="buttons">
						<button class="secondary" onclick="carrito.incrementarProducto('${producto}')">
							<i class="fas fa-plus"></i>
						</button>
						<button class="secondary" onclick="carrito.reducirCantidad('${producto}')">
							<i class="fas fa-minus"></i>
						</button>
						<button class="secondary" onclick="carrito.borrarProducto('${producto}')">
							<i class="fas fa-trash-alt"></i>
						</button>
					</section>
				</section>
			`;
			$carrito.innerHTML += productoHTML;
		}
		let totalHTML = `
			<section class="total">
				<input type="text" id="code" placeholder="Codigo de descuento" onblur="carrito.aplicarDescuento()">
				<p>Total a pagar: <b id="total">$${this.total.toFixed(2)}</b></p>
				<br>
				<button class="primary" onclick="carrito.guardarCarrito()">Guardar</button>
			</section>
		`;
		$carrito.innerHTML += totalHTML;
	},
};

async function init() {
	let db = await fetch(
		'https://facturas-master-cecg-default-rtdb.firebaseio.com/products.json'
	);
	let productos = await db.json();
	let $productos = document.getElementById('productos');

	$productos.innerHTML = '';
	for (let producto of productos) {
		$productos.innerHTML += `
			<section class="producto">
				<p>Nombre: <b>${producto.name}</b></p>
				<p>Precio: <b>$${producto.price}</b></p>
				<button
					class="primary"
					onclick="carrito.agregarProducto('${producto.id}', '${producto.name}', '${producto.price}')">
						Agregar
				</button>
			</section>
		`;
	}

	carrito.mostrarCarrito();
}

init();
