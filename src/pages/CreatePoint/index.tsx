import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet';
import api, { baseURL } from '../../services/api';

import './styles.css';

import logo from '../../assets/logo.svg';

interface Item {
  id: number;
  title: string;
  image_name: string;
}

interface IBGEUFResponse {
  sigla: string;
}
interface IBGECityResponse {
  nome: string;
}

const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [initial_position, setInitial_position] = useState<[number, number]>([0,0]);

  const [form_data, setForm_data] = useState({
    name: '',
    email: '',
    whatsapp: ''
  });

  const [selected_marker_pos, setSelected_marker_pos] = useState<[number, number]>([0,0]);
  const [selected_uf, setSelected_uf] = useState<string>('0');
  const [selected_city, setSelected_city] = useState<string>('0');
  const [selected_items, setSelected_items] = useState<number[]>([]);

  const history = useHistory();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      setInitial_position([latitude, longitude]);
    })
  }, []);

  useEffect(() => {
    api.get('items').then(res => {
      setItems(res.data);
    });
  }, []);

  useEffect(() => {
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(res => {
      const uf_initials = res.data.map(uf => uf.sigla);
      setUfs(uf_initials);
    });
  }, []);

  useEffect(() => {
    if (selected_uf === '0'){
      return;
    }

    axios
      .get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selected_uf}/municipios`)
      .then(res => {
        const city_names = res.data.map(city => city.nome);
        setCities(city_names);
      });
  }, [selected_uf])

  function handleSelectetUf(event: ChangeEvent<HTMLSelectElement>) {
    const uf = event.target.value;
    setSelected_uf(uf);
  }
  function handleSelectetCity(event: ChangeEvent<HTMLSelectElement>) {
    const city = event.target.value;
    setSelected_city(city);
  }
  function handleMapClick(event: LeafletMouseEvent) {
    setSelected_marker_pos([
      event.latlng.lat,
      event.latlng.lng,
    ])
  }
  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setForm_data({ ...form_data, [name]: value })
  }
  function handleSelectItem(id: number) {
    const already_selected = selected_items.findIndex(item => item === id);
    if (already_selected >= 0){
      const filtered_items = selected_items.filter(item => item !== id);
      setSelected_items(filtered_items);
    } else {
      setSelected_items([ ...selected_items, id]);
    }
  }
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    
    const { name, email, whatsapp } = form_data;
    const uf = selected_uf;
    const city = selected_city;
    const [ latitude, longitude ] = selected_marker_pos;
    const items = selected_items;

    const data = {
      name,
      email,
      whatsapp,
      uf,
      city,
      latitude,
      longitude,
      items
    }

    await api.post('points', data);
    history.push('/');
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta"/>
        <Link to="/">
          <FiArrowLeft />
          Voltar para Home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>Cadastro do <br/>Ponto de Coleta</h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input 
              type="text"
              name="name"
              id="name"
              onChange={handleInputChange}
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input 
                type="email"
                name="email"
                id="email"
                onChange={handleInputChange}
              />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input 
                type="text"
                name="whatsapp"
                id="whatsapp"
                onChange={handleInputChange}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={initial_position} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selected_marker_pos}>
            </Marker>
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estador (UF)</label>
              <select
                name="uf"
                id="uf"
                value={selected_uf}
                onChange={handleSelectetUf}
              >
                <option value="0">Selecione uma UF</option>
                { ufs.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                )) }
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select
                name="city"
                id="city"
                value={selected_city}
                onChange={handleSelectetCity}
              >
                <option value="0">Selecione uma cidade</option>
                { cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                )) }
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>

          <ul className="items-grid">
            {items.map(item => (
              <li
                key={ item.id }
                onClick={() => handleSelectItem(item.id)}
                className={selected_items.includes(item.id) ? 'selected' : ''}
              >
                <img src={ `${baseURL}/uploads/${item.image_name}` } alt={ item.title }/>
                <span>{ item.title }</span>
              </li>
            ))}
          </ul>
        </fieldset>
        
        <button type="submit">
          Cadastrar ponto de coleta
        </button>
      </form>
    </div>
  );
}

export default CreatePoint;