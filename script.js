let coordinates = [];

function collectCoordinates() {
	const numCitiesInput = document.getElementById("numCities");
	const numCities = parseInt(numCitiesInput.value);

	let coordinatesInput = "<div>";
	for (let i = 0; i < numCities; i++) {
		coordinatesInput += `<div id="input">City ${i + 1}: `;
		coordinatesInput += `<input type="number" id="x${i}" placeholder="X-coordinate">`;
		coordinatesInput += `<input type="number" id="y${i}" placeholder="Y-coordinate"></div>`;
	}
	coordinatesInput += "</div>";

	document.getElementById("coordinatesInput").innerHTML = coordinatesInput;
}

// function drawRoute(route, coordinates) {
// 	const svg = d3.select("#visualization");

// 	// Clear existing content
// 	svg.selectAll("*").remove();

// 	// Draw connecting lines between cities
// 	for (let i = 0; i < route.length - 1; i++) {
// 		const city1 = coordinates[route[i]];
// 		const city2 = coordinates[route[i + 1]];

// 		svg
// 			.append("line")
// 			.attr("x1", city1.x)
// 			.attr("y1", city1.y)
// 			.attr("x2", city2.x)
// 			.attr("y2", city2.y)
// 			.attr("stroke", "black")
// 			.attr("stroke-width", 2);
// 	}

// 	// Draw circles for each city
// 	svg
// 		.selectAll("circle")
// 		.data(coordinates)
// 		.enter()
// 		.append("circle")
// 		.attr("cx", (d) => d.x)
// 		.attr("cy", (d) => d.y)
// 		.attr("r", 6)
// 		.attr("fill", "red");
// }

class SA {
	constructor(n, maxit, maxitpermtemp, T, x = null, y = null) {
		this.n = n; // number of cities
		this.maxit = maxit;
		this.maxitpermtemp = maxitpermtemp;
		this.x = x !== null ? x : this.getRandomCoordinates(n);
		this.y = y !== null ? y : this.getRandomCoordinates(n);
		this.D = Array.from({ length: this.n }, () => Array(this.n).fill(0));
		this.tour = this.getRandomPermutation(this.n);
		this.bestcost = new Array(this.maxit).fill(0);
		this.T = T;

		// Calculate distances between cities
		for (let i = 0; i < this.n - 1; i++) {
			for (let j = 0; j < this.n; j++) {
				this.D[i][j] = Math.sqrt(
					Math.pow(this.x[i] - this.x[j], 2) +
						Math.pow(this.y[i] - this.y[j], 2)
				);
				this.D[j][i] = this.D[i][j];
			}
		}
	}

	getRandomCoordinates(n) {
		const coordinates = [];
		for (let i = 0; i < n; i++) {
			coordinates.push(Math.floor(Math.random() * 81) + 20); // Random values between 20 and 100
		}
		return coordinates;
	}

	getRandomPermutation(n) {
		const array = Array.from({ length: n }, (_, i) => i);
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}

	swap(route) {
		const ix = this.getRandomPermutation(route.length);
		const i1 = ix[1];
		const i2 = ix[2];
		const newRoute = [...route];
		[newRoute[i1], newRoute[i2]] = [newRoute[i2], newRoute[i1]];
		return newRoute;
	}

	cost(route) {
		let totalDistance = 0;
		for (let i = 0; i < this.n - 1; i++) {
			totalDistance += this.D[route[i]][route[i + 1]];
		}
		totalDistance += this.D[route[this.n - 1]][route[0]]; // Adding distance from the last to the first city
		return totalDistance;
	}

	main() {
		let sol_tour = this.tour.slice();
		let sol_cost = this.cost(sol_tour);

		let bestsol_tour = sol_tour.slice();
		let bestsol_cost = sol_cost;

		for (let it = 0; it < this.maxit; it++) {
			for (let it2 = 0; it2 < this.maxitpermtemp; it2++) {
				const newsol_tour = this.swap(sol_tour);
				const newsol_cost = this.cost(newsol_tour);

				if (newsol_cost < sol_cost) {
					sol_cost = newsol_cost;
					sol_tour = newsol_tour.slice();
				} else {
					const delta = newsol_cost - sol_cost;
					const p = Math.exp(-delta / this.T);

					if (Math.random() < p) {
						sol_cost = newsol_cost;
						sol_tour = newsol_tour.slice();
					}
				}

				if (sol_cost < bestsol_cost) {
					bestsol_cost = sol_cost;
					bestsol_tour = sol_tour.slice();
				}
			}
			this.bestcost[it] = bestsol_cost;
			this.T *= 0.99;
		}

		this.visualizeRoute(bestsol_tour, bestsol_cost);
	}

	visualizeRoute(tour, cost) {
		const visualizationDiv = document.getElementById("visualization");
		visualizationDiv.innerHTML = `<p>Best Route: ${tour}</p>`;
		visualizationDiv.innerHTML += `<p>Total Distance: ${cost.toFixed(
			3
		)} km</p>`;

		visualizationDiv.innerHTML += `<p>${JSON.stringify(tour)}</p>`;
	}
}

function startSimulation() {
	const numCitiesInput = document.getElementById("numCities");
	const numCities = parseInt(numCitiesInput.value);

	coordinates = [];
	for (let i = 0; i < numCities; i++) {
		const xCoord = parseInt(document.getElementById(`x${i}`).value);
		const yCoord = parseInt(document.getElementById(`y${i}`).value);
		coordinates.push({ x: xCoord, y: yCoord });
	}

	const temperature = 10;
	const iterations = 200;
	const iterationsPerTemp = 10;

	const sa = new SA(
		numCities,
		iterations,
		iterationsPerTemp,
		temperature,
		coordinates.map((c) => c.x),
		coordinates.map((c) => c.y)
	);
	sa.main(); // Run the simulated annealing algorithm
}
