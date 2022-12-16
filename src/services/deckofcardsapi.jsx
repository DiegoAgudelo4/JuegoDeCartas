const getIdGame = async () => {
	const url = 'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1';
	const res = await fetch(url);
	const data = await res.json();
	return data?.deck_id;
};

const getCards = async (deckId, cantidad) => {
	const url = `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${cantidad}`;
	const res = await fetch(url);
	const data = await res.json();
	console.log("cartas restantes en el mazo: ",data.remaining)
	if(data.remaining==0){ //verifica que hayan cartas, si no, se devuelve null para tratar la excepcion
		return null;
	}
	return data?.cards;
};

const DeckOfCardsAPI = {
	getIdGame,
	getCards,
};

export default DeckOfCardsAPI;
