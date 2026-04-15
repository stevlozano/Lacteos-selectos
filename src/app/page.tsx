'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/context/ThemeContext';

const PHONE_NUMBER = '51932398293';

function generateInquiryMessage(): string {
  const date = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let message = `🥛 *Consulta - Lácteos Selectos*\n\n`;
  message += `📅 *Fecha:* ${date}\n\n`;
  message += `👋 Hola, vi su página web y me interesa conocer más sobre sus productos lácteos.\n\n`;
  message += `🧀 *Productos de interés:*\n`;
  message += `• Yogurts naturales y de sabores\n`;
  message += `• Quesos frescos artesanales\n`;
  message += `• Mantequilla natural\n`;
  message += `• Manjar blanco tradicional\n\n`;
  message += `¿Podrían enviarme el catálogo con precios actuales y disponibilidad?\n\n`;
  message += `Gracias 😊`;

  return message;
}

function openWhatsApp() {
  const message = generateInquiryMessage();
  const url = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

const featuredProducts = [
  {
    id: 'yogurt-fresa',
    name: 'Yogurt de Fresa',
    description: 'Elaborado con fresas frescas seleccionadas a mano, nuestro yogurt de fresa combina la suavidad cremosa de la leche entera con el sabor natural y dulce de las mejores fresas de la temporada. Sin conservantes artificiales ni colorantes.',
    price: 9.00,
    unit: 'Litro',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&h=400&fit=crop',
  },
  {
    id: 'queso-fresco',
    name: 'Queso Fresco Artesanal',
    description: 'Nuestro queso fresco se elabora diariamente con leche de vacas pastoreadas en praderas locales. De textura suave y sabor delicado, es perfecto para ensaladas, arepas o simplemente disfrutarlo con un poco de miel.',
    price: 8.00,
    unit: '500g',
    image: 'https://images.unsplash.com/photo-1486297672812-fdc81a5e3fa7?w=600&h=400&fit=crop',
  },
  {
    id: 'manjar-artesanal',
    name: 'Manjar Blanco Artesanal',
    description: 'Siguiendo una receta familiar transmitida por generaciones, nuestro manjar blanco se cocina lentamente durante horas para lograr esa textura cremosa y sabor inconfundible que solo el tiempo y la paciencia pueden crear.',
    price: 6.00,
    unit: '400g',
    image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&h=400&fit=crop',
  },
];

const testimonials = [
  {
    name: 'María Elena Ríos',
    location: 'Cliente desde 2022',
    text: 'Los yogurts de Lácteos Selectos son simplemente incomparables. La frescura se siente desde el primer bocado, y saber que son productos locales sin químicos me da mucha tranquilidad para mi familia.',
  },
  {
    name: 'Carlos Mendoza',
    location: 'Cliente desde 2023',
    text: 'El manjar blanco me transporta a la cocina de mi abuela. Nunca pensé que encontraría algo tan auténtico y delicioso. El servicio a domicilio es puntual y los productos siempre llegan perfectamente frescos.',
  },
  {
    name: 'Ana Lucía Vargas',
    location: 'Cliente desde 2021',
    text: 'Como chef, valoro la calidad de los ingredientes sobre todo. El queso fresco de aquí tiene un sabor y textura que eleva cualquier plato. Mis clientes siempre preguntan de dónde viene mi queso.',
  },
];

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-neutral-100 dark:border-neutral-900">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-light tracking-tight hover:opacity-70 transition-opacity">
            Lácteos Selectos
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/login"
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
              aria-label="Admin"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
              aria-label="Toggle theme"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {theme === 'dark' ? (
                  <>
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </>
                ) : (
                  <>
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
            {/* Text Content */}
            <div className="order-2 lg:order-1">
              <p className="text-sm font-light tracking-widest text-neutral-500 dark:text-neutral-400 uppercase mb-4">
                Tradición desde 2015
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extralight tracking-tight leading-tight mb-6">
                Lácteos artesanales
                <br />
                <span className="font-normal">directo a tu puerta</span>
              </h1>
              
              <p className="text-lg font-light text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed max-w-lg">
                En Lácteos Selectos llevamos más de 8 años elaborando productos lácteos 100% artesanales. 
                Utilizamos leche fresca de vacas pastoreadas en praderas locales, combinando técnicas 
                tradicionales con los más altos estándares de calidad para ofrecerte yogurts cremosos, 
                quesos irresistibles, mantequilla pura y manjar blanco que sabe a tradición.
              </p>

              {/* Stats */}
              <div className="flex gap-8 mb-10">
                <div>
                  <p className="text-3xl font-light">8+</p>
                  <p className="text-xs font-light text-neutral-500 dark:text-neutral-400">Años de experiencia</p>
                </div>
                <div>
                  <p className="text-3xl font-light">2,500+</p>
                  <p className="text-xs font-light text-neutral-500 dark:text-neutral-400">Clientes satisfechos</p>
                </div>
                <div>
                  <p className="text-3xl font-light">100%</p>
                  <p className="text-xs font-light text-neutral-500 dark:text-neutral-400">Productos naturales</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/tienda"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-light text-sm tracking-wide hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all duration-300"
                >
                  Ver productos
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="group-hover:translate-x-1 transition-transform"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>

                <button
                  onClick={openWhatsApp}
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 border border-neutral-200 dark:border-neutral-800 rounded-full font-light text-sm tracking-wide hover:border-neutral-400 dark:hover:border-neutral-600 transition-all duration-300 bg-transparent text-inherit cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Escribir por WhatsApp
                </button>
              </div>
            </div>

            {/* Hero Image */}
            <div className="order-1 lg:order-2 relative">
              <div className="relative aspect-square lg:aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                <Image
                  src="https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800&h=1000&fit=crop"
                  alt="Productos lácteos artesanales frescos"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-white dark:bg-neutral-900 p-4 rounded-xl shadow-lg border border-neutral-100 dark:border-neutral-800">
                <p className="text-xs font-light text-neutral-500 dark:text-neutral-400">Entrega gratis</p>
                <p className="text-sm font-normal">En pedidos mayores a S/50</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* About Section */}
      <section className="py-24 px-6 border-t border-neutral-100 dark:border-neutral-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                <Image
                  src="https://images.unsplash.com/photo-1563635700-ceb069926b47?w=800&h=600&fit=crop"
                  alt="Vaca pastando en pradera verde"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-black dark:bg-white text-white dark:text-black p-6 rounded-2xl shadow-xl">
                <p className="text-3xl font-light">8</p>
                <p className="text-xs font-light">Años de tradición</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-light tracking-widest text-neutral-500 dark:text-neutral-400 uppercase mb-4">
                Nuestra Historia
              </p>
              <h2 className="text-3xl sm:text-4xl font-extralight tracking-tight mb-6">
                De la pradera a tu mesa, con amor artesanal
              </h2>
              <div className="space-y-4 text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                <p>
                  Lácteos Selectos nació en el 2015 de la pasión de una familia por la producción láctea tradicional. 
                  Lo que comenzó como una pequeña quesería familiar en las afueras de la ciudad, ha crecido hasta 
                  convertirse en un referente de calidad artesanal en la región.
                </p>
                <p>
                  Nuestros productos elaboran cada mañana con leche fresca de vacas que pastan libremente en praderas 
                  certificadas, alimentadas exclusivamente con hierba natural y sin uso de hormonas artificiales. 
                  Este compromiso con la calidad desde la fuente se traduce en productos de sabor inigualable.
                </p>
                <p>
                  Cada yogurt, queso, mantequilla y manjar que sale de nuestra cocina lleva consigo la dedicación 
                  de artesanos que han perfeccionado sus técnicas durante décadas. No utilizamos conservantes 
                  artificiales ni colorantes, porque creemos que lo natural siempre sabe mejor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 px-6 bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-light tracking-widest text-neutral-500 dark:text-neutral-400 uppercase mb-4">
              Nuestros Favoritos
            </p>
            <h2 className="text-3xl sm:text-4xl font-extralight tracking-tight mb-4">
              Productos más queridos
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 font-light max-w-2xl mx-auto">
              Estos son los productos que nuestros clientes adoran y piden una y otra vez. 
              Cada uno elaborado con la misma dedicidad y cuidado de siempre.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-white dark:bg-black rounded-2xl overflow-hidden border border-neutral-100 dark:border-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-normal">{product.name}</h3>
                    <span className="text-sm font-light text-neutral-500 dark:text-neutral-400">
                      S/{product.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm font-light text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-light text-neutral-400 dark:text-neutral-600">
                      {product.unit}
                    </span>
                    <Link
                      href="/tienda"
                      className="text-sm font-light hover:underline underline-offset-4"
                    >
                      Ver en tienda →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/tienda"
              className="inline-flex items-center gap-2 px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-light text-sm tracking-wide hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all duration-300"
            >
              Ver todos los productos
            </Link>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 px-6 border-t border-neutral-100 dark:border-neutral-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-light tracking-widest text-neutral-500 dark:text-neutral-400 uppercase mb-4">
              Nuestro Proceso
            </p>
            <h2 className="text-3xl sm:text-4xl font-extralight tracking-tight mb-4">
              Artesanía en cada paso
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 font-light max-w-2xl mx-auto">
              Desde la ordenña hasta la entrega en tu hogar, cada etapa de nuestro proceso 
              está diseñada para preservar la frescura y calidad que nos caracteriza.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Ordeña diaria',
                description: 'Cada madrugada, ordenamos a nuestras vacas para obtener leche fresca de la más alta calidad, rica en nutrientes naturales.',
              },
              {
                step: '02',
                title: 'Pasteurización cuidadosa',
                description: 'La leche se pasteuriza a baja temperatura para eliminar bacterias sin comprometer el sabor natural ni los nutrientes.',
              },
              {
                step: '03',
                title: 'Elaboración artesanal',
                description: 'Nuestros maestros queseros transforman la leche en productos únicos usando técnicas tradicionales transmitidas por generaciones.',
              },
              {
                step: '04',
                title: 'Envasado y entrega',
                description: 'Cada producto se envasa cuidadosamente y se entrega el mismo día de su elaboración para garantizar la máxima frescura.',
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
                  <span className="text-lg font-extralight text-neutral-400 dark:text-neutral-600">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-sm font-normal mb-3">{item.title}</h3>
                <p className="text-sm font-light text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-light tracking-widest text-neutral-500 dark:text-neutral-400 uppercase mb-4">
              Testimonios
            </p>
            <h2 className="text-3xl sm:text-4xl font-extralight tracking-tight">
              Lo que dicen nuestros clientes
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white dark:bg-black p-8 rounded-2xl border border-neutral-100 dark:border-neutral-900"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-neutral-800 dark:text-neutral-200"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 font-light leading-relaxed mb-6">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div>
                  <p className="font-normal text-sm">{testimonial.name}</p>
                  <p className="text-xs font-light text-neutral-500 dark:text-neutral-400">
                    {testimonial.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 border-t border-neutral-100 dark:border-neutral-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extralight tracking-tight mb-6">
            ¿Listo para probar la diferencia artesanal?
          </h2>
          <p className="text-lg font-light text-neutral-600 dark:text-neutral-400 mb-10 max-w-2xl mx-auto">
            Descubre por qué más de 2,500 familias confían en nosotros para llevar 
            productos lácteos frescos y naturales a su mesa cada día.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tienda"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-light text-sm tracking-wide hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all duration-300"
            >
              Explorar productos
            </Link>
            <button
              onClick={openWhatsApp}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-neutral-200 dark:border-neutral-800 rounded-full font-light text-sm tracking-wide hover:border-neutral-400 dark:hover:border-neutral-600 transition-all duration-300 bg-transparent text-inherit cursor-pointer"
            >
              Consultar por WhatsApp
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-neutral-100 dark:border-neutral-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-lg font-light tracking-tight mb-4">Lácteos Selectos</h3>
              <p className="text-sm font-light text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Productos lácteos artesanales elaborados con pasión desde 2015. 
                Frescura, calidad y tradición en cada bocado.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-normal mb-4">Productos</h4>
              <ul className="space-y-2 text-sm font-light text-neutral-500 dark:text-neutral-400">
                <li><Link href="/tienda" className="hover:text-black dark:hover:text-white transition-colors">Yogurts</Link></li>
                <li><Link href="/tienda" className="hover:text-black dark:hover:text-white transition-colors">Quesos</Link></li>
                <li><Link href="/tienda" className="hover:text-black dark:hover:text-white transition-colors">Mantequilla</Link></li>
                <li><Link href="/tienda" className="hover:text-black dark:hover:text-white transition-colors">Manjar Blanco</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-normal mb-4">Contacto</h4>
              <ul className="space-y-2 text-sm font-light text-neutral-500 dark:text-neutral-400">
                <li>WhatsApp: +51 932 398 293</li>
                <li>Email: hola@lacteosselectos.com</li>
                <li>Lunes a Sábado: 6am - 6pm</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-normal mb-4">Síguenos</h4>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
                  aria-label="Instagram"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
                  aria-label="Facebook"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-neutral-100 dark:border-neutral-900 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs font-light text-neutral-400 dark:text-neutral-600">
              © {new Date().getFullYear()} Lácteos Selectos. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/tienda"
                className="text-xs font-light text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
              >
                Tienda
              </Link>
              <button
                onClick={openWhatsApp}
                className="text-xs font-light text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors bg-transparent border-none cursor-pointer"
              >
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
