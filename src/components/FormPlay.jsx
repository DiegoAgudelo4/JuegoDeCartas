import React, { useEffect } from "react";//para usar la funcion useEffect
import Button from 'react-bootstrap/Button';
import Stack from 'react-bootstrap/Stack';
import useGame from '../hooks/useGame';

const FormPlay = () => {
	const { requestCards } = useGame();
	const handleClick = async () => {
		await requestCards();
	};

	return (
		<Stack gap={2} className='col-md-5 mx-auto'>
			<Button onClick={handleClick} variant='secondary'>
				Iniciar
			</Button>
		</Stack>
	);
};
export default FormPlay;
