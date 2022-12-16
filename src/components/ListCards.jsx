import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import useGame from '../hooks/useGame';
const ListCards = () => {
	const { playerOne, playerTwo, cartaRaspar, BuscarYReemplazarP2, 
		BuscarYReemplazarP1, cargarRaspar, ordenarCartas, comprobarGanador} = useGame();
	return (
		<Container>
			<Col>
				<Row>
					<Col className='col-md-10'>
						<div className='align-items-center my-2'>
							<div className='row'>
								<div className="col-3">
									<h4>Jugador {playerOne.name}</h4>
									<p>Cartas obtenidas</p>
								</div>
								<div className="col-3">
									<Button variant="secondary" onClick={() => {
										ordenarCartas(false);
									}} >Ordenar por ternas</Button>
								</div>
								<div className="col-3">
									<Button variant="secondary" onClick={() => {
										ordenarCartas(true);
									}}>Ordenar por escaleras</Button>
								</div>
								<div className="col-3">
									<Button variant="secondary" onClick={() => {
										comprobarGanador();
									}}>cantar victoria</Button>
								</div>
							</div>

							{playerOne.cards.map((card, index) => (
								<img
									className='col-sm-4 col-lg-1 mx-2 my-2'
									key={index}
									src={card.image}
									alt={card.code}
									onClick={async (event) => {
										// Extraer la información del elemento
										var informacion = event.target.alt;
										await BuscarYReemplazarP1(informacion);
										// Mostrar la información del elemento en la consola
										console.log("codigo de carta seleccionada: ",informacion);
									}}
								/>
							))}
						</div>
					</Col>
					<Col className='col-md-2'>
						<div className='align-items-center my-2'>
							<h4>Carta para raspar (Maso)</h4>
							{cartaRaspar.raspar.map((card, index) => (
								<img
									className='col-sm-1 col-lg-6 mx-2 my-2'
									key={index}
									src={card.image}
									alt={card.code}
									onClick={ () => {
										cargarRaspar();
									}}
								/>
							))}
						</div>
					</Col>
				</Row>

				<Row>
					<Col className='col-md-10'>
						<div className='align-items-center my-2'>
						<div className='row'>
								<div className="col-3">
									<h4>Jugador {playerTwo.name}</h4>
									<p>Cartas obtenidas</p>
								</div>
							</div>
							{playerTwo.cards.map((card, index) => (
								<img
									className='col-sm-4 col-lg-1 mx-2 my-2'
									key={index}
									src={card.image}
									alt={card.code}
									onClick={async (event) => {
										// Extraer la información del elemento
										var informacion = event.target.alt;
										await BuscarYReemplazarP2(informacion);
										// Mostrar la información del elemento en la consola
										console.log("codigo de carta seleccionada: ",informacion);
									}}
								/>
							))}
						</div>
					</Col>

				</Row>
			</Col>
		</Container>
	);
};

export default ListCards;
