import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Spinner,
  InputGroup, // Importa InputGroup
} from 'react-bootstrap';

function CharacterLoader() {
  // --- Estados ---
  // Estado para la lista maestra de personajes (todos)
  const [allCharacters, setAllCharacters] = useState([]);
  // Estado para la lista de personajes a mostrar (filtrados)
  const [filteredCharacters, setFilteredCharacters] = useState([]);
  // Estado de carga
  const [loading, setLoading] = useState(true);
  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  // Estado para el filtro de género
  const [genderFilter, setGenderFilter] = useState('all'); // 'all', 'male', 'female', 'n/a'

  // --- Efecto para Cargar TODOS los personajes (Req. 5) ---
  useEffect(() => {
    const fetchAllCharacters = async () => {
      setLoading(true);
      let charactersList = [];
      let nextUrl = 'https://swapi.dev/api/people/';

      try {
        // Bucle para recorrer todas las páginas de la API
        while (nextUrl) {
          const response = await axios.get(nextUrl);
          charactersList = [...charactersList, ...response.data.results];
          nextUrl = response.data.next; // URL de la siguiente página (o null si es la última)
        }

        setAllCharacters(charactersList); // Guarda la lista maestra
        setFilteredCharacters(charactersList); // Inicialmente muestra todos
      } catch (error) {
        console.error('Error fetching all characters:', error);
      }
      setLoading(false);
    };

    fetchAllCharacters();
  }, []); // El array vacío [] significa que esto se ejecuta solo una vez, al montar el componente

  // --- Efecto para Filtrar y Ordenar (Req. 3, 4, 6) ---
  useEffect(() => {
    let characters = [...allCharacters];

    // 1. Filtrar por Género (Req. 6)
    if (genderFilter !== 'all') {
      characters = characters.filter(
        (character) => character.gender === genderFilter
      );
    }

    // 2. Filtrar por Nombre (Búsqueda en tiempo real) (Req. 3)
    if (searchTerm) {
      characters = characters.filter((character) =>
        // --- AQUÍ ESTÁ EL CAMBIO ---
        character.name.toLowerCase().startsWith(searchTerm.toLowerCase())
      );
    }

    // 3. Ordenar Alfabéticamente (Req. 4)
    characters.sort((a, b) => a.name.localeCompare(b.name));

    // 4. Actualizar la lista visible
    setFilteredCharacters(characters);
  }, [searchTerm, genderFilter, allCharacters]); // Se re-ejecuta si cambia la búsqueda, el filtro o la lista maestra

  // --- Renderizado ---
  return (
    <Container className="my-4">
      <h1 className="text-center mb-4">Personajes de Star Wars</h1>

      {/* --- Formularios de Filtro y Búsqueda (Req. 2, 3, 6) --- */}
      <Row className="mb-4">
        {/* Campo de Búsqueda */}
        <Col md={8}>
          <Form.Group>
            <Form.Label>Buscar personaje</Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
              />
              <InputGroup.Text>🔍</InputGroup.Text>
            </InputGroup>
          </Form.Group>
        </Col>

        {/* Filtro de Género */}
        <Col md={4}>
          <Form.Group>
            <Form.Label>Filtrar por Género</Form.Label>
            <Form.Select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              disabled={loading}
            >
              <option value="all">Todos</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="n/a">n/a</option>
              <option value="hermaphrodite">Hermaphrodite</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* --- Contenido Principal (Spinner o Tarjetas) --- */}
      {loading ? (
        // (Req. 2) Muestra un spinner mientras carga
        <div className="text-center">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Cargando personajes...</span>
          </Spinner>
          <p>Cargando todos los personajes...</p>
        </div>
      ) : (
        // (Req. 2) Muestra las tarjetas con los resultados
        <Row>
          {filteredCharacters.length > 0 ? (
            filteredCharacters.map((character) => (
              <Col
                key={character.name} // Es mejor usar un ID único si la API lo da, pero 'name' es único en SWAPI
                xs={12}
                sm={6}
                md={4}
                lg={3}
                className="mb-4"
              >
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <Card.Title className="text-primary">
                      {character.name}
                    </Card.Title>
                    <Card.Text>
                      <strong>Género:</strong> {character.gender}
                      <br />
                      <strong>Año de nac.:</strong> {character.birth_year}
                      <br />
                      {/* (Req. 6) Agregamos más filtros (peso) */}
                      <strong>Peso:</strong> {character.mass} kg
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            // Mensaje si no hay resultados
            <Col className="text-center">
              <p>No se encontraron personajes con esos filtros.</p>
            </Col>
          )}
        </Row>
      )}
    </Container>
  );
}

export default CharacterLoader;