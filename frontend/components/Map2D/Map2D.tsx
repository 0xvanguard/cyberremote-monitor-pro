'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix para iconos de Leaflet en Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface CountryData {
  name: string
  latlng: [number, number]
  intensity: number
  jobs: number
  freelance: number
  contract: number
  fastEntry: boolean
  region: string
  signals: string[]
  cities?: Array<{ name: string; latlng: [number, number] }>
}

interface Map2DProps {
  selectedCountry?: string
  onSelectCountry?: (code: string) => void
}

// Mapeo de códigos de país a nombres
const nameToCode: Record<string, string> = {
  'United States of America': 'US', 'United States': 'US',
  'Canada': 'CA', 'Mexico': 'MX', 'Colombia': 'CO',
  'Brazil': 'BR', 'Argentina': 'AR', 'Chile': 'CL',
  'United Kingdom': 'GB', 'Germany': 'DE', 'France': 'FR',
  'Spain': 'ES', 'Portugal': 'PT', 'Italy': 'IT',
  'Japan': 'JP', 'Australia': 'AU', 'India': 'IN',
  'South Korea': 'KR', 'China': 'CN', 'Singapore': 'SG',
  'Netherlands': 'NL', 'Belgium': 'BE', 'Sweden': 'SE',
  'Norway': 'NO', 'Switzerland': 'CH', 'Ireland': 'IE',
  'Israel': 'IL', 'United Arab Emirates': 'AE', 'Saudi Arabia': 'SA',
  'Turkey': 'TR', 'Egypt': 'EG', 'South Africa': 'ZA',
  'Nigeria': 'NG', 'Kenya': 'KE', 'Poland': 'PL',
  'Czech Republic': 'CZ', 'Romania': 'RO', 'Ukraine': 'UA',
  'Finland': 'FI', 'Denmark': 'DK', 'Austria': 'AT',
  'Peru': 'PE', 'Ecuador': 'EC', 'Venezuela': 'VE',
  'Costa Rica': 'CR', 'Panama': 'PA', 'Guatemala': 'GT',
  'Cuba': 'CU', 'Dominican Republic': 'DO', 'Jamaica': 'JM',
  'Puerto Rico': 'PR', 'Honduras': 'HN', 'Nicaragua': 'NI',
  'El Salvador': 'SV', 'Bolivia': 'BO', 'Paraguay': 'PY',
  'Uruguay': 'UY', 'New Zealand': 'NZ', 'Philippines': 'PH',
  'Malaysia': 'MY', 'Indonesia': 'ID', 'Thailand': 'TH',
  'Vietnam': 'VN', 'Pakistan': 'PK', 'Bangladesh': 'BD',
  'Sri Lanka': 'LK', 'Nepal': 'NP', 'Morocco': 'MA',
  'Algeria': 'DZ', 'Tunisia': 'TN', 'Ghana': 'GH',
  'Ethiopia': 'ET', 'Tanzania': 'TZ', 'Uganda': 'UG',
  'Rwanda': 'RW', 'Senegal': 'SN', 'Cameroon': 'CM',
  'Ivory Coast': 'CI', 'Mozambique': 'MZ', 'Angola': 'AO',
  'Zambia': 'ZM', 'Zimbabwe': 'ZW', 'Botswana': 'BW',
  'Namibia': 'NA', 'Madagascar': 'MG', 'Mauritius': 'MU',
  'Iceland': 'IS', 'Luxembourg': 'LU', 'Malta': 'MT',
  'Cyprus': 'CY', 'Croatia': 'HR', 'Slovenia': 'SI',
  'Slovakia': 'SK', 'Hungary': 'HU', 'Bulgaria': 'BG',
  'Serbia': 'RS', 'Montenegro': 'ME', 'North Macedonia': 'MK',
  'Albania': 'AL', 'Bosnia and Herzegovina': 'BA', 'Kosovo': 'XK',
  'Moldova': 'MD', 'Belarus': 'BY', 'Lithuania': 'LT',
  'Latvia': 'LV', 'Estonia': 'EE', 'Georgia': 'GE',
  'Armenia': 'AM', 'Azerbaijan': 'AZ', 'Kazakhstan': 'KZ',
  'Uzbekistan': 'UZ', 'Turkmenistan': 'TM', 'Kyrgyzstan': 'KG',
  'Tajikistan': 'TJ', 'Mongolia': 'MN', 'Myanmar': 'MM',
  'Cambodia': 'KH', 'Laos': 'LA', 'Brunei': 'BN',
  'Taiwan': 'TW', 'Hong Kong': 'HK', 'Macau': 'MO',
  'Guam': 'GU', 'Fiji': 'FJ', 'Papua New Guinea': 'PG',
  'Trinidad and Tobago': 'TT', 'Haiti': 'HT', 'Belize': 'BZ',
  'Suriname': 'SR', 'Guyana': 'GY', 'French Guiana': 'GF',
  'Greenland': 'GL', 'Faroe Islands': 'FO', 'Gibraltar': 'GI',
  'Isle of Man': 'IM', 'Jersey': 'JE', 'Guernsey': 'GG',
  'Liechtenstein': 'LI', 'Andorra': 'AD', 'Monaco': 'MC',
  'San Marino': 'SM', 'Vatican City': 'VA', 'Barbados': 'BB',
  'Bahamas': 'BS', 'Bermuda': 'BM', 'Cayman Islands': 'KY',
  'Aruba': 'AW', 'Curacao': 'CW', 'Sint Maarten': 'SX',
  'Saint Martin': 'MF', 'Guadeloupe': 'GP', 'Martinique': 'MQ',
  'Saint Lucia': 'LC', 'Saint Vincent': 'VC', 'Grenada': 'GD',
  'Antigua and Barbuda': 'AG', 'Saint Kitts': 'KN',
  'Tonga': 'TO', 'Samoa': 'WS', 'Vanuatu': 'VU',
  'Solomon Islands': 'SB', 'Micronesia': 'FM', 'Palau': 'PW',
  'Marshall Islands': 'MH', 'Kiribati': 'KI', 'Nauru': 'NR',
  'Tuvalu': 'TV', 'Maldives': 'MV', 'Mauritania': 'MR',
  'Mali': 'ML', 'Burkina Faso': 'BF', 'Niger': 'NE',
  'Chad': 'TD', 'Central African Republic': 'CF', 'Sudan': 'SD',
  'South Sudan': 'SS', 'Somalia': 'SO', 'Djibouti': 'DJ',
  'Eritrea': 'ER', 'Libya': 'LY', 'Togo': 'TG',
  'Benin': 'BJ', 'Guinea': 'GN', 'Guinea-Bissau': 'GW',
  'Sierra Leone': 'SL', 'Liberia': 'LR', 'Gambia': 'GM',
  'Cape Verde': 'CV', 'Sao Tome': 'ST', 'Equatorial Guinea': 'GQ',
  'Gabon': 'GA', 'Republic of the Congo': 'CG',
  'Democratic Republic of the Congo': 'CD',
  'Lesotho': 'LS', 'Eswatini': 'SZ', 'Comoros': 'KM',
  'Seychelles': 'SC', 'Reunion': 'RE', 'Mayotte': 'YT',
  'Western Sahara': 'EH', 'Somaliland': 'SO',
  'Iraq': 'IQ', 'Iran': 'IR', 'Syria': 'SY',
  'Jordan': 'JO', 'Lebanon': 'LB', 'Yemen': 'YE',
  'Oman': 'OM', 'Qatar': 'QA', 'Kuwait': 'KW',
  'Bahrain': 'BH', 'Afghanistan': 'AF',
}

// Ciudades conocidas del mundo (gaceteo amplio)
const CITY_COORDS = [
  // América del Norte
  { n: 'New York', alt: ['Nueva York'], cc: 'US', ll: [40.71, -74.01] as [number, number] },
  { n: 'Los Angeles', alt: ['LA'], cc: 'US', ll: [34.05, -118.24] as [number, number] },
  { n: 'Chicago', cc: 'US', ll: [41.88, -87.63] as [number, number] },
  { n: 'Houston', cc: 'US', ll: [29.76, -95.37] as [number, number] },
  { n: 'Miami', cc: 'US', ll: [25.76, -80.19] as [number, number] },
  { n: 'San Francisco', alt: ['SF'], cc: 'US', ll: [37.77, -122.42] as [number, number] },
  { n: 'Washington D.C.', alt: ['Washington'], cc: 'US', ll: [38.9, -77.04] as [number, number] },
  { n: 'Austin', cc: 'US', ll: [30.27, -97.74] as [number, number] },
  { n: 'Seattle', cc: 'US', ll: [47.61, -122.33] as [number, number] },
  { n: 'Denver', cc: 'US', ll: [39.74, -104.99] as [number, number] },
  { n: 'Boston', cc: 'US', ll: [42.36, -71.06] as [number, number] },
  { n: 'Atlanta', cc: 'US', ll: [33.75, -84.39] as [number, number] },
  { n: 'Toronto', cc: 'CA', ll: [43.65, -79.38] as [number, number] },
  { n: 'Vancouver', cc: 'CA', ll: [49.28, -123.12] as [number, number] },
  { n: 'Montreal', cc: 'CA', ll: [45.5, -73.57] as [number, number] },
  { n: 'Calgary', cc: 'CA', ll: [51.05, -114.07] as [number, number] },
  { n: 'Ottawa', cc: 'CA', ll: [45.42, -75.7] as [number, number] },
  { n: 'Ciudad de México', alt: ['CDMX', 'Mexico City'], cc: 'MX', ll: [19.43, -99.13] as [number, number] },
  { n: 'Guadalajara', cc: 'MX', ll: [20.66, -103.35] as [number, number] },
  { n: 'Monterrey', cc: 'MX', ll: [25.69, -100.32] as [number, number] },
  // América Central y Caribe
  { n: 'San José', alt: ['San Jose CR'], cc: 'CR', ll: [9.93, -84.08] as [number, number] },
  { n: 'Panamá', alt: ['Panama City'], cc: 'PA', ll: [8.98, -79.52] as [number, number] },
  { n: 'La Habana', alt: ['Havana'], cc: 'CU', ll: [23.11, -82.37] as [number, number] },
  { n: 'Santo Domingo', cc: 'DO', ll: [18.47, -69.9] as [number, number] },
  { n: 'San Juan', cc: 'PR', ll: [18.47, -66.11] as [number, number] },
  // América del Sur
  { n: 'Bogotá', alt: ['Bogota'], cc: 'CO', ll: [4.61, -74.08] as [number, number] },
  { n: 'Medellín', alt: ['Medellin'], cc: 'CO', ll: [6.24, -75.58] as [number, number] },
  { n: 'Cali', cc: 'CO', ll: [3.45, -76.53] as [number, number] },
  { n: 'Barranquilla', cc: 'CO', ll: [10.97, -74.8] as [number, number] },
  { n: 'São Paulo', alt: ['Sao Paulo'], cc: 'BR', ll: [-23.55, -46.63] as [number, number] },
  { n: 'Rio de Janeiro', cc: 'BR', ll: [-22.91, -43.17] as [number, number] },
  { n: 'Brasilia', cc: 'BR', ll: [-15.78, -47.93] as [number, number] },
  { n: 'Salvador', cc: 'BR', ll: [-12.97, -38.51] as [number, number] },
  { n: 'Buenos Aires', cc: 'AR', ll: [-34.6, -58.38] as [number, number] },
  { n: 'Córdoba', alt: ['Cordoba'], cc: 'AR', ll: [-31.42, -64.18] as [number, number] },
  { n: 'Santiago', cc: 'CL', ll: [-33.45, -70.67] as [number, number] },
  { n: 'Lima', cc: 'PE', ll: [-12.05, -77.04] as [number, number] },
  { n: 'Quito', cc: 'EC', ll: [-0.18, -78.47] as [number, number] },
  { n: 'Montevideo', cc: 'UY', ll: [-34.9, -56.16] as [number, number] },
  { n: 'La Paz', cc: 'BO', ll: [-16.5, -68.15] as [number, number] },
  { n: 'Caracas', cc: 'VE', ll: [10.48, -66.9] as [number, number] },
  { n: 'Asunción', cc: 'PY', ll: [-25.26, -57.58] as [number, number] },
  // Europa
  { n: 'London', alt: ['Londres'], cc: 'GB', ll: [51.51, -0.13] as [number, number] },
  { n: 'Manchester', cc: 'GB', ll: [53.48, -2.24] as [number, number] },
  { n: 'Edinburgh', cc: 'GB', ll: [55.95, -3.19] as [number, number] },
  { n: 'Paris', alt: ['París'], cc: 'FR', ll: [48.86, 2.35] as [number, number] },
  { n: 'Lyon', cc: 'FR', ll: [45.76, 4.84] as [number, number] },
  { n: 'Marsella', alt: ['Marseille'], cc: 'FR', ll: [43.3, 5.37] as [number, number] },
  { n: 'Berlin', alt: ['Berlín'], cc: 'DE', ll: [52.52, 13.41] as [number, number] },
  { n: 'Munich', alt: ['Múnich', 'München'], cc: 'DE', ll: [48.14, 11.58] as [number, number] },
  { n: 'Hamburgo', alt: ['Hamburg'], cc: 'DE', ll: [53.55, 10.0] as [number, number] },
  { n: 'Frankfurt', cc: 'DE', ll: [50.11, 8.68] as [number, number] },
  { n: 'Madrid', cc: 'ES', ll: [40.42, -3.7] as [number, number] },
  { n: 'Barcelona', cc: 'ES', ll: [41.39, 2.17] as [number, number] },
  { n: 'Valencia', cc: 'ES', ll: [39.47, -0.38] as [number, number] },
  { n: 'Lisboa', alt: ['Lisbon'], cc: 'PT', ll: [38.72, -9.14] as [number, number] },
  { n: 'Oporto', alt: ['Porto'], cc: 'PT', ll: [41.15, -8.61] as [number, number] },
  { n: 'Roma', alt: ['Rome'], cc: 'IT', ll: [41.9, 12.5] as [number, number] },
  { n: 'Milán', alt: ['Milan'], cc: 'IT', ll: [45.46, 9.19] as [number, number] },
  { n: 'Nápoles', alt: ['Naples'], cc: 'IT', ll: [40.85, 14.27] as [number, number] },
  { n: 'Turín', alt: ['Turin'], cc: 'IT', ll: [45.07, 7.69] as [number, number] },
  { n: 'Amsterdam', alt: ['Ámsterdam'], cc: 'NL', ll: [52.37, 4.9] as [number, number] },
  { n: 'Rotterdam', cc: 'NL', ll: [51.92, 4.48] as [number, number] },
  { n: 'Bruselas', alt: ['Brussels', 'Bruxelles'], cc: 'BE', ll: [50.85, 4.35] as [number, number] },
  { n: 'Dublín', alt: ['Dublin'], cc: 'IE', ll: [53.35, -6.26] as [number, number] },
  { n: 'Varsovia', alt: ['Warsaw'], cc: 'PL', ll: [52.23, 21.01] as [number, number] },
  { n: 'Krakow', cc: 'PL', ll: [50.06, 19.94] as [number, number] },
  { n: 'Praga', alt: ['Prague'], cc: 'CZ', ll: [50.08, 14.44] as [number, number] },
  { n: 'Bucarest', alt: ['Bucharest'], cc: 'RO', ll: [44.43, 26.1] as [number, number] },
  { n: 'Budapest', cc: 'HU', ll: [47.5, 19.04] as [number, number] },
  { n: 'Estocolmo', alt: ['Stockholm'], cc: 'SE', ll: [59.33, 18.06] as [number, number] },
  { n: 'Oslo', cc: 'NO', ll: [59.91, 10.75] as [number, number] },
  { n: 'Copenhague', alt: ['Copenhagen'], cc: 'DK', ll: [55.68, 12.57] as [number, number] },
  { n: 'Helsinki', cc: 'FI', ll: [60.17, 24.94] as [number, number] },
  { n: 'Zúrich', alt: ['Zurich'], cc: 'CH', ll: [47.37, 8.54] as [number, number] },
  { n: 'Ginebra', alt: ['Geneva'], cc: 'CH', ll: [46.2, 6.14] as [number, number] },
  { n: 'Viena', alt: ['Vienna'], cc: 'AT', ll: [48.21, 16.37] as [number, number] },
  { n: 'Atenas', alt: ['Athens'], cc: 'GR', ll: [37.98, 23.73] as [number, number] },
  { n: 'Kiev', alt: ['Kyiv'], cc: 'UA', ll: [50.45, 30.52] as [number, number] },
  { n: 'Minsk', cc: 'BY', ll: [53.9, 27.57] as [number, number] },
  { n: 'Belgrado', alt: ['Belgrade'], cc: 'RS', ll: [44.79, 20.47] as [number, number] },
  { n: 'Zagreb', cc: 'HR', ll: [45.81, 15.98] as [number, number] },
  { n: 'Liubliana', alt: ['Ljubljana'], cc: 'SI', ll: [46.06, 14.51] as [number, number] },
  { n: 'Sofía', alt: ['Sofia'], cc: 'BG', ll: [42.7, 23.32] as [number, number] },
  { n: 'Riga', cc: 'LV', ll: [56.95, 24.11] as [number, number] },
  { n: 'Vilna', alt: ['Vilnius'], cc: 'LT', ll: [54.69, 25.28] as [number, number] },
  { n: 'Tallin', alt: ['Tallinn'], cc: 'EE', ll: [59.44, 24.75] as [number, number] },
  { n: 'Reikiavik', alt: ['Reykjavik'], cc: 'IS', ll: [64.13, -21.89] as [number, number] },
  { n: 'Luxemburgo', alt: ['Luxembourg'], cc: 'LU', ll: [49.61, 6.13] as [number, number] },
  // Rusia
  { n: 'Moscú', alt: ['Moscow'], cc: 'RU', ll: [55.76, 37.62] as [number, number] },
  { n: 'San Petersburgo', alt: ['Saint Petersburg'], cc: 'RU', ll: [59.93, 30.32] as [number, number] },
  // Medio Oriente
  { n: 'Dubai', alt: ['Dubái'], cc: 'AE', ll: [25.2, 55.27] as [number, number] },
  { n: 'Abu Dhabi', cc: 'AE', ll: [24.45, 54.65] as [number, number] },
  { n: 'Riad', alt: ['Riyadh'], cc: 'SA', ll: [24.71, 46.68] as [number, number] },
  { n: 'Jeddah', cc: 'SA', ll: [21.49, 39.19] as [number, number] },
  { n: 'Tel Aviv', cc: 'IL', ll: [32.09, 34.78] as [number, number] },
  { n: 'Jerusalén', alt: ['Jerusalem'], cc: 'IL', ll: [31.77, 35.23] as [number, number] },
  { n: 'Estambul', alt: ['Istanbul'], cc: 'TR', ll: [41.01, 28.98] as [number, number] },
  { n: 'Ankara', cc: 'TR', ll: [39.93, 32.86] as [number, number] },
  { n: 'Doha', cc: 'QA', ll: [25.29, 51.53] as [number, number] },
  { n: 'Kuwait City', cc: 'KW', ll: [29.38, 47.99] as [number, number] },
  { n: 'Manama', cc: 'BH', ll: [26.23, 50.59] as [number, number] },
  { n: 'Mascate', alt: ['Muscat'], cc: 'OM', ll: [23.59, 58.54] as [number, number] },
  { n: 'Amán', alt: ['Amman'], cc: 'JO', ll: [31.95, 35.93] as [number, number] },
  { n: 'Beirut', cc: 'LB', ll: [33.89, 35.5] as [number, number] },
  { n: 'El Cairo', alt: ['Cairo'], cc: 'EG', ll: [30.04, 31.24] as [number, number] },
  { n: 'Bagdad', alt: ['Baghdad'], cc: 'IQ', ll: [33.31, 44.37] as [number, number] },
  { n: 'Teherán', alt: ['Tehran'], cc: 'IR', ll: [35.69, 51.39] as [number, number] },
  // Asia
  { n: 'Singapur', alt: ['Singapore'], cc: 'SG', ll: [1.35, 103.82] as [number, number] },
  { n: 'Tokio', alt: ['Tokyo'], cc: 'JP', ll: [35.68, 139.69] as [number, number] },
  { n: 'Osaka', cc: 'JP', ll: [34.69, 135.5] as [number, number] },
  { n: 'Kioto', alt: ['Kyoto'], cc: 'JP', ll: [35.01, 135.77] as [number, number] },
  { n: 'Seúl', alt: ['Seoul'], cc: 'KR', ll: [37.57, 126.98] as [number, number] },
  { n: 'Busán', alt: ['Busan'], cc: 'KR', ll: [35.18, 129.08] as [number, number] },
  { n: 'Pekín', alt: ['Beijing'], cc: 'CN', ll: [39.9, 116.4] as [number, number] },
  { n: 'Shanghái', alt: ['Shanghai'], cc: 'CN', ll: [31.23, 121.47] as [number, number] },
  { n: 'Shenzhen', cc: 'CN', ll: [22.54, 114.06] as [number, number] },
  { n: 'Cantón', alt: ['Guangzhou'], cc: 'CN', ll: [23.13, 113.26] as [number, number] },
  { n: 'Chengdu', cc: 'CN', ll: [30.57, 104.07] as [number, number] },
  { n: 'Hangzhou', cc: 'CN', ll: [30.27, 120.15] as [number, number] },
  { n: 'Bombay', alt: ['Mumbai'], cc: 'IN', ll: [19.08, 72.88] as [number, number] },
  { n: 'Nueva Delhi', alt: ['New Delhi'], cc: 'IN', ll: [28.61, 77.21] as [number, number] },
  { n: 'Bangalore', cc: 'IN', ll: [12.97, 77.59] as [number, number] },
  { n: 'Hyderabad', cc: 'IN', ll: [17.39, 78.49] as [number, number] },
  { n: 'Chennai', cc: 'IN', ll: [13.08, 80.27] as [number, number] },
  { n: 'Pune', cc: 'IN', ll: [18.52, 73.86] as [number, number] },
  { n: 'Kolkata', cc: 'IN', ll: [22.57, 88.36] as [number, number] },
  { n: 'Taipéi', alt: ['Taipei'], cc: 'TW', ll: [25.03, 121.57] as [number, number] },
  { n: 'Hong Kong', cc: 'HK', ll: [22.32, 114.17] as [number, number] },
  { n: 'Bangkok', cc: 'TH', ll: [13.76, 100.5] as [number, number] },
  { n: 'Kuala Lumpur', cc: 'MY', ll: [3.14, 101.69] as [number, number] },
  { n: 'Yakarta', alt: ['Jakarta'], cc: 'ID', ll: [-6.21, 106.85] as [number, number] },
  { n: 'Manila', cc: 'PH', ll: [14.6, 120.98] as [number, number] },
  { n: 'Hanói', alt: ['Hanoi'], cc: 'VN', ll: [21.03, 105.85] as [number, number] },
  { n: 'Ho Chi Minh', alt: ['Saigon'], cc: 'VN', ll: [10.82, 106.63] as [number, number] },
  { n: 'Rangún', alt: ['Yangon'], cc: 'MM', ll: [16.87, 96.2] as [number, number] },
  { n: 'Colombo', cc: 'LK', ll: [6.93, 79.85] as [number, number] },
  { n: 'Katmandú', alt: ['Kathmandu'], cc: 'NP', ll: [27.72, 85.32] as [number, number] },
  { n: 'Daca', alt: ['Dhaka'], cc: 'BD', ll: [23.81, 90.41] as [number, number] },
  { n: 'Islamabad', cc: 'PK', ll: [33.69, 73.04] as [number, number] },
  { n: 'Karachi', cc: 'PK', ll: [24.86, 67.01] as [number, number] },
  { n: 'Almaty', cc: 'KZ', ll: [43.24, 76.95] as [number, number] },
  { n: 'Taskent', alt: ['Tashkent'], cc: 'UZ', ll: [41.3, 69.28] as [number, number] },
  // África
  { n: 'Casablanca', cc: 'MA', ll: [33.57, -7.59] as [number, number] },
  { n: 'Marrakech', cc: 'MA', ll: [31.63, -8.0] as [number, number] },
  { n: 'Johannesburg', alt: ['Johannesburgo'], cc: 'ZA', ll: [-26.2, 28.03] as [number, number] },
  { n: 'Ciudad del Cabo', alt: ['Cape Town'], cc: 'ZA', ll: [-33.92, 18.42] as [number, number] },
  { n: 'Durban', cc: 'ZA', ll: [-29.86, 31.02] as [number, number] },
  { n: 'Nairobi', cc: 'KE', ll: [-1.29, 36.82] as [number, number] },
  { n: 'Lagos', cc: 'NG', ll: [6.52, 3.38] as [number, number] },
  { n: 'Abuya', alt: ['Abuja'], cc: 'NG', ll: [9.06, 7.49] as [number, number] },
  { n: 'Accra', cc: 'GH', ll: [5.6, -0.19] as [number, number] },
  { n: 'Addis Abeba', alt: ['Addis Ababa'], cc: 'ET', ll: [9.02, 38.75] as [number, number] },
  { n: 'El Cairo', alt: ['Cairo'], cc: 'EG', ll: [30.04, 31.24] as [number, number] },
  { n: 'Alejandría', alt: ['Alexandria'], cc: 'EG', ll: [31.2, 29.92] as [number, number] },
  { n: 'Dar es Salaam', cc: 'TZ', ll: [-6.79, 39.28] as [number, number] },
  { n: 'Kinsasa', alt: ['Kinshasa'], cc: 'CD', ll: [-4.44, 15.27] as [number, number] },
  { n: 'Lubumbashi', cc: 'CD', ll: [-11.68, 27.5] as [number, number] },
  { n: 'Dakar', cc: 'SN', ll: [14.72, -17.47] as [number, number] },
  { n: 'Túnez', alt: ['Tunis'], cc: 'TN', ll: [36.81, 10.18] as [number, number] },
  { n: 'Argel', alt: ['Algiers'], cc: 'DZ', ll: [36.75, 3.06] as [number, number] },
  { n: 'Maputo', cc: 'MZ', ll: [-25.97, 32.57] as [number, number] },
  { n: 'Luanda', cc: 'AO', ll: [-8.84, 13.23] as [number, number] },
  { n: 'Harare', cc: 'ZW', ll: [-17.83, 31.05] as [number, number] },
  { n: 'Kampala', cc: 'UG', ll: [0.35, 32.58] as [number, number] },
  { n: 'Kigali', cc: 'RW', ll: [-1.94, 30.06] as [number, number] },
  { n: 'Lusaka', cc: 'ZM', ll: [-15.39, 28.32] as [number, number] },
  { n: 'Gaborone', cc: 'BW', ll: [-24.63, 25.92] as [number, number] },
  { n: 'Windhoek', cc: 'NA', ll: [-22.56, 17.08] as [number, number] },
  { n: 'Antananarivo', cc: 'MG', ll: [-18.91, 47.54] as [number, number] },
  // Oceanía
  { n: 'Sídney', alt: ['Sydney'], cc: 'AU', ll: [-33.87, 151.21] as [number, number] },
  { n: 'Melbourne', cc: 'AU', ll: [-37.81, 144.96] as [number, number] },
  { n: 'Brisbane', cc: 'AU', ll: [-27.47, 153.03] as [number, number] },
  { n: 'Perth', cc: 'AU', ll: [-31.95, 115.86] as [number, number] },
  { n: 'Adelaide', cc: 'AU', ll: [-34.93, 138.6] as [number, number] },
  { n: 'Auckland', cc: 'NZ', ll: [-36.85, 174.76] as [number, number] },
  { n: 'Wellington', cc: 'NZ', ll: [-41.29, 174.78] as [number, number] },
  { n: 'Suva', cc: 'FJ', ll: [-18.14, 178.44] as [number, number] },
]

function getHeatColor(intensity: number): string {
  // Colores más sutiles y suaves para el relleno de países
  if (intensity >= 90) return '#2d6a4f'
  if (intensity >= 75) return '#40916c'
  if (intensity >= 60) return '#7f8c5c'
  if (intensity >= 45) return '#3a7ca5'
  if (intensity >= 25) return '#5c5c8a'
  return '#2a2a3e'
}

export function Map2D({ selectedCountry = 'US', onSelectCountry }: Map2DProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null)
  const [dataset, setDataset] = useState<Record<string, CountryData>>({})
  const [isLoaded, setIsLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{ name: string; cc: string; ll: [number, number]; type: 'country' | 'city' }>>([])
  const [showResults, setShowResults] = useState(false)

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      try {
        const responses = await Promise.all([
          fetch('/data/countries.json'),
          fetch('/data/countries-extra.json'),
        ])
        const [main, extra] = await Promise.all(responses.map(r => r.json()))
        setDataset({ ...main, ...extra })
      } catch (error) {
        console.error('Error loading country data:', error)
      }
    }
    loadData()
  }, [])

  // Inicializar mapa
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      dragging: true,
      touchZoom: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      keyboard: true,
      worldCopyJump: true,
      preferCanvas: true,
      minZoom: 2,
      maxZoom: 18,  // Permitir zoom hasta nivel de calle
    }).setView([20, -20], 2)

    // Tiles principales (oscuro, sin etiquetas)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
      attribution: '© <a href="https://carto.com/">CARTO</a> © OSM contributors',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map)

    // Capa de etiquetas (nombres de países y ciudades)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
      attribution: '',
      subdomains: 'abcd',
      maxZoom: 19,
      opacity: 0.85,
    }).addTo(map)

    L.control.scale({ imperial: false }).addTo(map)

    mapInstanceRef.current = map

    // Cargar GeoJSON
    loadGeoJson(map)

    setTimeout(() => map.invalidateSize(), 300)

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Cargar GeoJSON de países
  const loadGeoJson = async (map: L.Map) => {
    try {
      const res = await fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
      const world = await res.json()

      const geoJsonLayer = L.geoJSON(world, {
        style: (feature) => {
          const code = resolveCode(feature)
          const data = code ? dataset[code] : undefined
          if (data) {
            return {
              fillColor: getHeatColor(data.intensity),
              weight: 0.6,
              opacity: 0.8,
              color: '#3a4a5c',
              fillOpacity: 0.35,  // Muy sutil para no tapar el zoom
            }
          }
          return {
            fillColor: '#1a2535',
            weight: 0.3,
            opacity: 0.4,
            color: '#253550',
            fillOpacity: 0.2,
          }
        },
        onEachFeature: (feature, layer) => {
          const code = resolveCode(feature)
          const data = code ? dataset[code] : undefined
          if (code && data) {
            layer.bindTooltip(
              `<div style="font-size:12px;font-weight:600">${data.name}</div>
               <div style="font-size:11px;color:#94a3b8">Intensidad: ${data.intensity} · ${data.jobs || 0} empleos</div>`,
              { sticky: true, className: 'country-tooltip' }
            )
            layer.on({
              click: () => {
                onSelectCountry?.(code)
                // Zoom al país
                const geoLayer = layer as L.GeoJSON
                const bounds = geoLayer.getBounds()
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 })
              },
              mouseover: (e) => {
                e.target.setStyle({ weight: 1.5, color: '#dbe7ff', fillOpacity: 0.5 })
              },
              mouseout: () => {
                geoJsonLayer.resetStyle(layer)
              },
            })
          }
        },
      }).addTo(map)

      geoJsonLayerRef.current = geoJsonLayer
      setIsLoaded(true)
    } catch (error) {
      console.error('Error loading GeoJSON:', error)
    }
  }

  // Resolver código de país desde feature GeoJSON
  const resolveCode = (feature: any): string | null => {
    const props = feature.properties
    if (props.iso_a2 && props.iso_a2 !== '-99' && props.iso_a2 !== '') return props.iso_a2
    return nameToCode[props.name || ''] || nameToCode[props.NAME || ''] || null
  }

  // Búsqueda de países y ciudades
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    const nq = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const results: Array<{ name: string; cc: string; ll: [number, number]; type: 'country' | 'city' }> = []

    // Buscar países
    Object.entries(dataset).forEach(([code, data]) => {
      const haystack = (data.name + ' ' + code).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      if (haystack.includes(nq)) {
        results.push({ name: data.name, cc: code, ll: data.latlng, type: 'country' })
      }
    })

    // Buscar ciudades
    CITY_COORDS.forEach(city => {
      const names = [city.n, ...(city.alt || [])]
      const haystack = names.join(' ').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      if (haystack.includes(nq)) {
        results.push({ name: city.n, cc: city.cc, ll: city.ll, type: 'city' })
      }
    })

    setSearchResults(results.slice(0, 8))
    setShowResults(true)
  }

  // Navegar a resultado de búsqueda
  const goToResult = (result: { name: string; cc: string; ll: [number, number]; type: 'country' | 'city' }) => {
    if (!mapInstanceRef.current) return

    const zoom = result.type === 'city' ? 12 : 5
    mapInstanceRef.current.flyTo(result.ll, zoom, { duration: 1.5 })
    onSelectCountry?.(result.cc)
    setSearchQuery('')
    setSearchResults([])
    setShowResults(false)
  }

  // Fly to selected country
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedCountry || !dataset[selectedCountry]) return

    const country = dataset[selectedCountry]
    if (country.latlng) {
      mapInstanceRef.current.flyTo(country.latlng, 4.5, { duration: 1.15 })
      
      // Highlight country
      if (geoJsonLayerRef.current) {
        geoJsonLayerRef.current.eachLayer((layer: any) => {
          const code = resolveCode(layer.feature)
          if (code && code === selectedCountry) {
            layer.setStyle({ weight: 2, color: '#0ea5e9', fillOpacity: 0.55 })
            setTimeout(() => {
              geoJsonLayerRef.current?.resetStyle(layer)
            }, 2000)
          }
        })
      }
    }
  }, [selectedCountry, dataset])

  return (
    <div className="w-full h-full relative">
      {/* Barra de búsqueda flotante */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-[420px]">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchQuery && setShowResults(true)}
            placeholder="🔍 Buscar país o ciudad... ej: Colombia, Bogotá, Madrid"
            className="w-full px-4 py-3 pl-10 bg-cyber-dark/95 border border-cyber-accent/40 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyber-accent focus:ring-1 focus:ring-cyber-accent/50 backdrop-blur-sm shadow-lg shadow-black/30"
          />
          <svg className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Resultados de búsqueda */}
        {showResults && searchResults.length > 0 && (
          <div className="mt-1 bg-cyber-dark/95 border border-cyber-accent/30 rounded-xl overflow-hidden shadow-lg shadow-black/40 backdrop-blur-sm">
            {searchResults.map((result, i) => (
              <button
                key={i}
                onClick={() => goToResult(result)}
                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-cyber-accent/20 transition-colors text-left border-b border-slate-700/30 last:border-0"
              >
                <span className="text-lg">{result.type === 'country' ? '🏳️' : '📍'}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{result.name}</div>
                  <div className="text-xs text-slate-400">
                    {result.type === 'country' ? 'País' : `Ciudad · ${result.cc}`}
                  </div>
                </div>
                {result.type === 'country' && dataset[result.cc] && (
                  <span className="text-xs font-bold" style={{ color: getHeatColor(dataset[result.cc].intensity) }}>
                    {dataset[result.cc].intensity}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Leyenda */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-cyber-dark/90 backdrop-blur-sm rounded-xl p-3 shadow-lg shadow-black/30">
        <div className="text-xs font-semibold text-white mb-2">Intensidad Laboral</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#2d6a4f' }} />
            <span className="text-xs text-slate-300">Alta (90+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#40916c' }} />
            <span className="text-xs text-slate-300">Media-Alta (75-89)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#7f8c5c' }} />
            <span className="text-xs text-slate-300">Media (60-74)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#3a7ca5' }} />
            <span className="text-xs text-slate-300">Emergente (45-59)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#5c5c8a' }} />
            <span className="text-xs text-slate-300">Baja (25-44)</span>
          </div>
        </div>
      </div>

      {/* Mapa */}
      <div ref={mapRef} className="w-full h-full" />
      
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-cyber-dark/80 z-[999]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyber-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Cargando mapa...</p>
          </div>
        </div>
      )}
    </div>
  )
}
