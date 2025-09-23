import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <Link to="/signin" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio de sesión
        </Link>
      </div>
      <div className="prose dark:prose-invert max-w-none">
        <h1>Política de Privacidad</h1>
        <p><strong>Última actualización:</strong> 23 de Septiembre de 2025</p>

        <h2>1. Introducción</h2>
        <p>
          Bienvenido a Circulapp. Respetamos tu privacidad y nos comprometemos a proteger tus datos personales.
          Esta política de privacidad te informará sobre cómo cuidamos tus datos personales cuando visitas nuestra aplicación
          y te informa sobre tus derechos de privacidad y cómo la ley te protege.
        </p>

        <h2>2. Datos que recopilamos sobre ti</h2>
        <p>
          Podemos recopilar, usar, almacenar y transferir diferentes tipos de datos personales sobre ti, que hemos agrupado de la siguiente manera:
          <ul>
            <li><strong>Datos de Identidad:</strong> incluye nombre, apellido, nombre de usuario o identificador similar.</li>
            <li><strong>Datos de Contacto:</strong> incluye dirección de correo electrónico y números de teléfono.</li>
            <li><strong>Datos Técnicos:</strong> incluye la dirección del protocolo de Internet (IP), tus datos de inicio de sesión, el tipo y la versión del navegador, la configuración de la zona horaria y la ubicación, los tipos y versiones de los plug-ins del navegador, el sistema operativo y la plataforma, y otra tecnología en los dispositivos que utilizas para acceder a esta aplicación.</li>
            <li><strong>Datos de Uso:</strong> incluye información sobre cómo utilizas nuestra aplicación, productos y servicios.</li>
          </ul>
        </p>

        <h2>3. Cómo usamos tus datos personales</h2>
        <p>
          Usaremos tus datos personales solo cuando la ley nos lo permita. Generalmente, usaremos tus datos personales en las siguientes circunstancias:
          <ul>
            <li>Cuando necesitemos ejecutar el contrato que estamos a punto de celebrar o hemos celebrado contigo.</li>
            <li>Cuando sea necesario para nuestros intereses legítimos (o los de un tercero) y tus intereses y derechos fundamentales no prevalezcan sobre dichos intereses.</li>
            <li>Cuando necesitemos cumplir con una obligación legal o regulatoria.</li>
          </ul>
        </p>

        <h2>4. Seguridad de los datos</h2>
        <p>
          Hemos implementado medidas de seguridad apropiadas para evitar que tus datos personales se pierdan accidentalmente, se usen o se acceda a ellos de forma no autorizada, se alteren o se divulguen. Además, limitamos el acceso a tus datos personales a aquellos empleados, agentes, contratistas y otros terceros que tienen una necesidad comercial de conocerlos.
        </p>

        <h2>5. Tus derechos legales</h2>
        <p>
          En determinadas circunstancias, tienes derechos en virtud de las leyes de protección de datos en relación con tus datos personales, incluido el derecho a solicitar acceso, corrección, eliminación, o restricción del procesamiento de tus datos personales.
        </p>

        <h2>6. Contacto</h2>
        <p>
          Si tienes alguna pregunta sobre esta política de privacidad, por favor contáctanos en [email de contacto].
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
