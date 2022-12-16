import { useState } from 'react';
import DeckOfCardsAPI from '../services/deckofcardsapi';
import GameContext from './GameContext';

const GameProvider = ({ children }) => {
	const [idGame, setIdGame] = useState(null);
	var [count, setCount] = useState(0);//esta varible es para saber si el juego ya comenzó, si está en 0 es el inicio, si está en 1 el juego ya inició
	const [win, setWin] = useState(false);
	const [showToast, setShowToast] = useState(false);
	const [winName, setWinName] = useState('');
	const [cartaRaspar, setRaspar] = useState({ //propiedades de la carta raspar, Nombre y cartas
		raspar: [],
	});
	//
	const [playerOne, setPlayerOne] = useState({ //propiedades del jugador uno, Nombre y cartas
		name: '',
		cards: [],
		turno: true
	});
	var [playerTwo, setPlayerTwo] = useState({//propiedades del jugador dos, Nombre y cartas
		name: '',
		cards: [],
		turno: false
	});

	const playGame = async () => {
		setIdGame(await DeckOfCardsAPI.getIdGame());
	};

	const llenarCartas = async () => {
		//cartas iniciales jugador uno
		var cards = await DeckOfCardsAPI.getCards(idGame, "10");
		for (let i = 0; i < cards.length; i++) {
			cards[i].code = codigoCartaACodigoNumero(cards[i].code, cards[i].suit);
		}
		playerOne.cards = cards;
		setPlayerOne(playerOne);
		console.log("se llenó las cartas de el jugador 1")
		//cartas iniciales jugador 2
		cards = await DeckOfCardsAPI.getCards(idGame, "10");
		for (let i = 0; i < cards.length; i++) {
			cards[i].code = codigoCartaACodigoNumero(cards[i].code, cards[i].suit);
		}
		playerTwo.cards = cards;
		setPlayerTwo(playerTwo);
		console.log("se llenó las cartas de el jugador 2");
		//se setea el contador para que no vuelva a activar esta opcion
		ordenarCartas();
		count = 1;
		setCount(count);
	}

	const cargarRaspar = async (comFromReem) => {
		// la variable comFromReem significa viene de reemplazar
		var cards = await DeckOfCardsAPI.getCards(idGame, "1");
		if (cards == null) {
			alert("el juego terminó");
			window.location = "http://localhost:5173";//papayaso, modificar
			return;
		}
		cards[0].code = codigoCartaACodigoNumero(cards[0].code, cards[0].suit);
		setRaspar({ ...cartaRaspar, raspar: [cartaRaspar.raspar, cards[0]] });
		if (playerOne.turno) {
			//esto se usa para evitar reescribir el estado del objeto
			//ya que si agregamos un nuevo valor o modificamos de nuevo
			//despúes de haberlo modificado en el mismo flujo, los cambios
			//anteriores se pierden, en este caso la carta reemplazada.
			if (!comFromReem) {
				setPlayerOne({ ...playerOne, turno: false });
			}
			setPlayerTwo({ ...playerTwo, turno: true });
			mostrarTurno(playerTwo.name);
		} else {
			if (!comFromReem) {
				setPlayerTwo({ ...playerTwo, turno: false });
			}
			setPlayerOne({ ...playerOne, turno: true });
			mostrarTurno(playerOne.name);
		}
		comprobarGanador();
	}
	const mostrarTurno = (Nombre) => {
		setWin(true);
		setShowToast(true);
		setWinName("turno de jugador: " + Nombre);
		/*setTimeout(() => {
			setWin(false);
			setShowToast(false);
		}, 5000);*/
	}
	const requestCards = async () => {
		if (count == 0) {//verifica el contador, si es 0 es porque acabó de iniciar la partida
			await llenarCartas();
			var cards = await DeckOfCardsAPI.getCards(idGame, "1");//obtiene dos cartas
			if (cards == null) {
				alert("el juego terminó")
				window.location = "http://localhost:5173"//papayaso, modificar
				return;
			}
			cards[0].code = codigoCartaACodigoNumero(cards[0].code, cards[0].suit);
			//le mete la carta a raspar 
			setRaspar({ ...cartaRaspar, raspar: [cartaRaspar.raspar, cards[0]] });
			mostrarTurno(playerOne.name);
		}
	};
	const BuscarYReemplazarP1 = async (codigoCarta) => {
		if (playerOne.turno) {
			const resultado = playerOne.cards.findIndex(elemento => elemento.code === codigoCarta); //encontramos el index		
			const newCards = [...playerOne.cards]; //creamos una copia del arreglo de las cartas
			newCards[resultado] = cartaRaspar.raspar[1];//guardamos el nuevo objeto en la posicion encontrada
			//guardamos las nuevas cartas en el objetoplayer
			setPlayerOne({ ...playerOne, cards: newCards, turno: false });//actualizamos todos los atributos
			//setPlayerTwo({ ...playerTwo, turno: true });//actualizamos el siguiente turno
			cargarRaspar(true);
		} else {
			mostrarTurno(playerTwo.name);
		}
	}
	const BuscarYReemplazarP2 = async (codigoCarta) => {
		if (playerTwo.turno) {
			const resultado = playerTwo.cards.findIndex(elemento => elemento.code === codigoCarta); //encontramos el index
			const newCards = [...playerTwo.cards]; //creamos una copia del arreglo de las cartas
			newCards[resultado] = cartaRaspar.raspar[1];//guardamos el nuevo objeto en la posicion encontrada
			//guardamos las nuevas cartas en el objetoplayer
			setPlayerTwo({ ...playerTwo, cards: newCards, turno: false });//actualizamos todos los atributos
			cargarRaspar(true);
		} else {
			mostrarTurno(playerOne.name);
		}
	}
	const ordenarCartas = (codigo) => {
		//codigo es true si se quiere ordenar por codigo
		var aux = playerOne.cards;
		Ordenar(aux, codigo);
		setPlayerOne({ ...playerOne, cards: aux });
		aux = playerTwo.cards;
		Ordenar(aux, codigo);
		setPlayerTwo({ ...playerTwo, cards: aux });
	}
	//para evitar redundancia en el codigo
	//siempre se ordena por referencia, ya se si se hace 
	//con valores superficiales se deben aplicar metodos de ordenamiento
	//según el tipo de dato recibido, en este caso arreglos.
	function Ordenar(aux, code) {
		if (code) {//si code es true, entonces se ordena de acuerdo el codigo
			aux.sort((a, b) => {
				// Compara los codigos de las cartas
				// y devuelve -1 si el codigo de "a" es menor que el codigo de "b",
				// 1 si el codigo de "a" es mayor que el codigo de "b",
				// y 0 si ambos codigos son iguales.
				if (parseInt(a.code) < parseInt(b.code)) {
					return -1;
				} else if (parseInt(a.code) > parseInt(b.code)) {
					return 1;
				} else {
					return 0;
				}
			});
			return;
		} else {
			//si no, se arregla deacuerdo al valor de la carta
			aux.sort((a, b) => {
				// Compara los valores de las cartas
				// y devuelve -1 si el valor de "a" es menor que el valor de "b",
				// 1 si el valor de "a" es mayor que el valor de "b",
				// y 0 si ambos valores son iguales.
				if (a.value < b.value) {
					return -1;
				} else if (a.value > b.value) {
					return 1;
				} else {
					return 0;
				}
			});
			return;
		}
	}
	function comprobarGanador() {
		//creo una copia del arreglo de las cartas de cada jugador con los atributos especificados
		var player1 = Object.values({ ...playerOne.cards }).map(({ code, suit, value }) => {
			return {
				code,
				suit,
				value
			}
		});
		var player2 = Object.values({ ...playerTwo.cards }).map(({ code, suit, value }) => {
			return {
				code,
				suit,
				value
			}
		});
		//solo puede haber una cuarta o una escalera a la vez
		var player1Wins = [{}, {}, false];//posicion 0, valores de la primera terna, 1 valores de la segunda terna, posicion 2 es la cuarta o escalera
		var player2Wins = [{}, {}, false];//posicion 0, valores de la primera terna, 1 valores de la segunda terna, posicion 2 es la cuarta o escalera
		//se ordena por valor, cuando se ordena por valor las cartas se agrupan por su numero
		//sin importar su tipo, ejemplo: 7H, 7S, 7D
		Ordenar(player1, false);//ordena por ternas, por valor.
		console.log("verificando ternas y cuartas del jugador 1");
		for (let i = 0; i < player1.length; i++) {
			console.log("Iteracion num", i);
			//verificamos que no se pase del limite del arreglo porque el numero maximo es 10, y los condicionales 
			//no permite que la iteracion llegue hasta 8, ya que en 8 no hay ternas ni cuartas
			if (i < 8) {
				//si el valor de la posicion actual, la siguiente de la actual y la siguiente de la siguiente
				// son iguales entonces hay una terna
				console.log("verificando terna en posicion [", i, "]: ", player1[i].value, " =? ", player1[i + 1].value, " =? ", player1[i + 2].value);
				if (player1[i].value == player1[i + 1].value && player1[i + 1].value == player1[i + 2].value) {
					//para una cuarta i debe ser menor que 7, 6+4=10
					if (i < 7) {
						console.log("verificando terna en posicion [", i, "]: ", player1[i].value, " =? ", player1[i + 1].value, " =? ", player1[i + 2].value, " =?", player1[i + 3].value);
						//verificamos si hay una cuarta
						if (player1[i + 2].value == player1[i + 3].value) {
							player1Wins[2] = true;//guardamos
							console.log("jugador 1 tiene una cuarta en la posicion ", i);
							i += 3;//para evitar iteraciones inecesarias, salta fuera de la cuarta
							continue;//sigue con la siguiente iteracion, para evitar llamar el siguiente codigo
						}
					}
					//si la primera posicion ya es true entonces guardame el registro en la 2
					if (player1Wins[0].ocupado) {
						player1Wins[1] = { ocupado: true, cartas: [player1[i], player1[i + 1], player1[i + 2]] };
					} else {//si no, en la primera
						player1Wins[0] = { ocupado: true, cartas: [player1[i], player1[i + 1], player1[i + 2]] };
					}
					console.log("jugador 1 tiene una terna en la posicion ", i);
					i += 2;//para evitar iteraciones inecesarias, salta fuera de la terna
				}
			}
		}
		//Se ordena por codigo, cuando se ordena por codigo las cartas 
		//se agrupan según su tipo, ejemplo: 2d,3d,7d,9d ó 2s,5s, 8s
		//por eso se facilita la forma para detectar escaleras.
		Ordenar(player1, true);//ordenar por escalera
		//si esta posicion es falsa es porque todavía no hay una cuarta
		if (!player1Wins[2]) {
			for (let i = 0; i < player1.length; i++) {
				if (i < 7) {
					//esta serie de condiciones busca una escalera de 4 posiciones, nada más.
					if (player1[i].code == (parseInt(player1[i + 1].code) - 1) && player1[i].suit == player1[i + 1].suit) {
						if (player1[i].code == (parseInt(player1[i + 2].code) - 2) && player1[i].suit == player1[i + 2].suit) {
							if (player1[i].code == (parseInt(player1[i + 3].code) - 3) && player1[i].suit == player1[i + 3].suit) {
								//console.log(player1[i].code, "=?", (parseInt(player1[i + 3].code) - 3), " && ", player1[i].suit," =?", player1[i + 3].suit);
								var existe = false;
								//si hay una terna de 5s, esos 5 no pueden estar en la escalera
								//--recorre el arreglo de player wins en busca de las cartas 
								//de la terna, si existen entonces recorre el arreglo de cartas
								//en busca de que estén en la escalera, sí existe una en la escalera
								//entonces, la escalera no vale--
								for (let j = 0; j < 2; j++) {
									if (player1Wins[j].ocupado) {
										for (let k = 0; k < 3; k++) {
											//player1Wins = [{}, {}, false];
											//player1Wins[0] = { ocupado: true , cartas: [player1[i], player1[i + 1], player1[i + 2]]};
											console.log(player1Wins[j].cartas[k].code, "=?", player1[i].code);
											//---esta condicion lo que verifica es que no haya una carta de una terna
											//en una escalera, si la encuentra, la escalera no se reconoce-- 
											if (player1Wins[j].cartas[k].code == player1[i].code
												|| player1Wins[j].cartas[k].code == player1[i + 1].code
												|| player1Wins[j].cartas[k].code == player1[i + 2].code
												|| player1Wins[j].cartas[k].code == player1[i + 3].code) {
												existe = true;
												break;
											}
										}
									}
									if (existe) {
										break;
									}
								}//si no existe alguna carta de la terna en la escalera, se toma como valida
								if (!existe) {
									console.log("el jugador 1 tiene una escalera de 4 en la posicion: ", i);
									player1Wins[2] = true;
									i += 3;
								}

							}
						}
					}
				}

			}
		}
		//si todas las posiciones son verdaderas significa que el jugador
		//tiene 2 ternas y una cuarta, o 2 ternas y una escalera.
		//console.log("Win1: ", player1Wins[0].ocupado, ", Win2: ", player1Wins[1].ocupado, " Win3:", player1Wins[2])
		if (player1Wins[0].ocupado && player1Wins[1].ocupado && player1Wins[2]) {
			alert("El jugador " + playerOne.name + " ganó, felicitaciones");
			window.location = "http://localhost:5173";
			return;
		}
		//se ordena por valor, cuando se ordena por valor las cartas se agrupan por su numero
		//sin importar su tipo, ejemplo: 7H, 7S, 7D
		// console.log(player2);
		Ordenar(player2, false);//ordena por ternas, por valor.
		// console.log(player2);
		//verificando ternas y cuartas del jugador 2
		console.log("verificando ternas y cuartas del jugador 2");
		for (let i = 0; i < player2.length; i++) {
			console.log("Iteracion num", i);
			//verificamos que no se pase del limite del arreglo porque el numero maximo es 10, y los condicionales 
			//no permite que la iteracion llegue hasta 8, ya que en 8 no hay ternas ni cuartas
			if (i < 8) {
				//si el valor de la posicion actual, la siguiente de la actual y la siguiente de la siguiente
				// son iguales entonces hay una terna
				console.log("verificando terna en posicion [", i, "]: ", player2[i].value, " =? ", player2[i + 1].value, " =? ", player2[i + 2].value);
				if (player2[i].value == player2[i + 1].value && player2[i + 1].value == player2[i + 2].value) {
					//para una cuarta i debe ser menor que 7, 6+4=10
					if (i < 7) {
						console.log("verificando terna en posicion [", i, "]: ", player2[i].value, " =? ", player2[i + 1].value, " =? ", player2[i + 2].value, " =?", player2[i + 3].value);
						//verificamos si hay una cuarta
						if (player2[i + 2].value == player2[i + 3].value) {
							player2Wins[2] = true;//guardamos
							console.log("jugador 2 tiene una cuarta en la posicion ", i);
							i += 3;//para evitar iteraciones inecesarias, salta fuera de la cuarta
							continue;//sigue con la siguiente iteracion, para evitar llamar el siguiente codigo
						}
					}
					//si la primera posicion ya es true entonces guardame el registro en la 2
					if (player2Wins[0].ocupado) {
						player2Wins[1] = { ocupado: true, cartas: [player2[i], player2[i + 1], player2[i + 2]] };
					} else {//si no, en la primera
						player2Wins[0] = { ocupado: true, cartas: [player2[i], player2[i + 1], player2[i + 2]] };
					}
					console.log("jugador 2 tiene una terna en la posicion ", i);
					i += 2;//para evitar iteraciones inecesarias, salta fuera de la terna
				}
			}
		}
		//Se ordena por codigo, cuando se ordena por codigo las cartas 
		//se agrupan según su tipo, ejemplo: 2d,3d,7d,9d ó 2s,5s, 8s
		//por eso se facilita la forma para detectar escaleras.
		Ordenar(player2, true);//ordenar por escalera
		//si esta posicion es falsa es porque todavía no hay una cuarta
		if (!player2Wins[2]) {
			for (let i = 0; i < player2.length; i++) {
				if (i < 7) {
					//esta serie de condiciones busca una escalera de 4 posiciones, nada más.
					if (player2[i].code == (parseInt(player2[i + 1].code) - 1) && player2[i].suit == player2[i + 1].suit) {
						if (player2[i].code == (parseInt(player2[i + 2].code) - 2) && player2[i].suit == player2[i + 2].suit) {
							if (player2[i].code == (parseInt(player2[i + 3].code) - 3) && player2[i].suit == player2[i + 3].suit) {
								//console.log(player1[i].code, "=?", (parseInt(player1[i + 3].code) - 3), " && ", player1[i].suit," =?", player1[i + 3].suit);
								var existe = false;
								//si hay una terna de 5s, esos 5 no pueden estar en la escalera
								//--recorre el arreglo de player wins en busca de las cartas 
								//de la terna, si existen entonces recorre el arreglo de cartas
								//en busca de que estén en la escalera, sí existe una en la escalera
								//entonces, la escalera no vale--
								for (let j = 0; j < 2; j++) {
									if (player2Wins[j].ocupado) {
										for (let k = 0; k < 3; k++) {
											//player1Wins = [{}, {}, false];
											//player1Wins[0] = { ocupado: true , cartas: [player1[i], player1[i + 1], player1[i + 2]]};
											console.log(player2Wins[j].cartas[k].code, "=?", player2[i].code);
											//---esta condicion lo que verifica es que no haya una carta de una terna
											//en una escalera, si la encuentra, la escalera no se reconoce-- 
											if (player2Wins[j].cartas[k].code == player2[i].code
												|| player2Wins[j].cartas[k].code == player2[i + 1].code
												|| player2Wins[j].cartas[k].code == player2[i + 2].code
												|| player2Wins[j].cartas[k].code == player2[i + 3].code) {
												existe = true;
												break;
											}
										}
									}
									if (existe) {
										break;
									}
								}
								//si no existe alguna carta de la terna en la escalera, se toma como valida
								if (!existe) {
									console.log("el jugador 1 tiene una escalera de 4 en la posicion: ", i);
									player2Wins[2] = true;
									i += 3;
								}
							}
						}
					}
				}
			}
		}
		if (player2Wins[0].ocupado && player2Wins[1].ocupado && player2Wins[2]) {
			alert("El jugador " + playerTwo.name + " ganó, felicitaciones");
			window.location = "http://localhost:5173";
			return;
		}
	}
	//devuelve el codigo de la carta dependiendo del codigo original
	// recibiendo el codigo original y la suit (Tipo de carta)
	const codigoCartaACodigoNumero = (codigo, suit) => {
		if (suit == "DIAMONDS") {
			if (codigo == "AD") {
				return "1";
			}
			if (codigo == "2D") {
				return "2";
			}
			if (codigo == "3D") {
				return "3";
			}
			if (codigo == "4D") {
				return "4";
			}
			if (codigo == "5D") {
				return "5";
			}
			if (codigo == "6D") {
				return "6";
			}
			if (codigo == "7D") {
				return "7";
			}
			if (codigo == "8D") {
				return "8";
			}
			if (codigo == "9D") {
				return "9";
			}
			if (codigo == "0D") {
				return "10";
			}
			if (codigo == "JD") {
				return "11";
			}
			if (codigo == "JD") {
				return "11";
			}
			if (codigo == "QD") {
				return "12";
			}
			if (codigo == "KD") {
				return "13";
			}
		}
		if (suit == "CLUBS") {
			if (codigo == "AC") {
				return "14";
			}
			if (codigo == "2C") {
				return "15";
			}
			if (codigo == "3C") {
				return "16";
			}
			if (codigo == "4C") {
				return "17";
			}
			if (codigo == "5C") {
				return "18";
			}
			if (codigo == "6C") {
				return "19";
			}
			if (codigo == "7C") {
				return "20";
			}
			if (codigo == "8C") {
				return "21";
			}
			if (codigo == "9C") {
				return "22";
			}
			if (codigo == "0C") {
				return "23";
			}
			if (codigo == "JC") {
				return "24";
			}
			if (codigo == "QC") {
				return "25";
			}
			if (codigo == "KC") {
				return "26";
			}
		}
		if (suit == "HEARTS") {
			if (codigo == "AH") {
				return "27";
			}
			if (codigo == "2H") {
				return "28";
			}
			if (codigo == "3H") {
				return "29";
			}
			if (codigo == "4H") {
				return "30";
			}
			if (codigo == "5H") {
				return "31";
			}
			if (codigo == "6H") {
				return "32";
			}
			if (codigo == "7H") {
				return "33";
			}
			if (codigo == "8H") {
				return "34";
			}
			if (codigo == "9H") {
				return "35";
			}
			if (codigo == "0H") {
				return "36";
			}
			if (codigo == "JH") {
				return "37";
			}
			if (codigo == "QH") {
				return "38";
			}
			if (codigo == "KH") {
				return "39";
			}
		}
		if (suit == "SPADES") {
			if (codigo == "AS") {
				return "40";
			}
			if (codigo == "2S") {
				return "41";
			}
			if (codigo == "3S") {
				return "42";
			}
			if (codigo == "4S") {
				return "43";
			}
			if (codigo == "5S") {
				return "44";
			}
			if (codigo == "6S") {
				return "45";
			}
			if (codigo == "7S") {
				return "46";
			}
			if (codigo == "8S") {
				return "47";
			}
			if (codigo == "9S") {
				return "48";
			}
			if (codigo == "0S") {
				return "49";
			}
			if (codigo == "JS") {
				return "50";
			}
			if (codigo == "QS") {
				return "51";
			}
			if (codigo == "KS") {
				return "52";
			}
		}
		return codigo;
	}
	return (
		<GameContext.Provider
			value={{
				playGame,
				requestCards,
				playerOne,
				setPlayerOne,
				playerTwo,
				cartaRaspar,
				setRaspar,
				setPlayerTwo,
				showToast,
				setShowToast,
				winName,
				llenarCartas,
				cargarRaspar,
				BuscarYReemplazarP1,
				BuscarYReemplazarP2,
				ordenarCartas,
				mostrarTurno,
				comprobarGanador
			}}
		>
			{children}
		</GameContext.Provider>
	);
};

export default GameProvider;
