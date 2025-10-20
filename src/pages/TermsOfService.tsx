import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <Link to="/signin" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio de sesión
        </Link>
      </div>
      <div className="prose dark:prose-invert max-w-none">
        <h1>Términos y Condiciones de Servicio</h1>
        <p><strong>Última actualización:</strong> 23 de Septiembre de 2025</p>

        <h2>1. Aceptación de los términos</h2>
        <p>
          Al acceder y utilizar Circulapp (la "Aplicación"), usted acepta y se compromete a cumplir con estos Términos de Servicio
          y todas las leyes y regulaciones aplicables. Si no está de acuerdo con alguno de estos términos, se le prohíbe
          utilizar o acceder a esta aplicación.
        </p>

        <h2>2. Licencia de uso</h2>
        <p>
          Se concede permiso para descargar temporalmente una copia de los materiales en la Aplicación para visualización transitoria personal y no comercial.
          Esta es la concesión de una licencia, no una transferencia de título, y bajo esta licencia no puede:
          <ul>
            <li>Modificar o copiar los materiales.</li>
            <li>Usar los materiales para cualquier propósito comercial, o para cualquier exhibición pública (comercial o no comercial).</li>
            <li>Intentar descompilar o realizar ingeniería inversa de cualquier software contenido en la Aplicación.</li>
            <li>Eliminar cualquier derecho de autor u otras anotaciones de propiedad de los materiales.</li>
          </ul>
          Esta licencia terminará automáticamente si usted viola cualquiera de estas restricciones y puede ser terminada por Circulapp en cualquier momento.
        </p>

        <h2>3. Responsabilidad del usuario</h2>
        <p>
          Usted es el único responsable del contenido que publica, enlaza o pone a disposición de cualquier otra forma en la Aplicación.
          Usted se compromete a no publicar contenido que sea ilegal, ofensivo, amenazante, difamatorio, obsceno o de cualquier otra forma objetable.
          Circulapp no se hace responsable de las transacciones o interacciones entre usuarios.
        </p>

        <h2>4. Limitaciones</h2>
        <p>
          En ningún caso Circulapp o sus proveedores serán responsables de los daños (incluidos, entre otros, los daños por pérdida de datos o beneficios, o por interrupción del negocio) que surjan del uso o la imposibilidad de usar los materiales en la Aplicación, incluso si Circulapp o un representante autorizado de Circulapp ha sido notificado oralmente o por escrito de la posibilidad de tales daños.
        </p>

        <h2>5. Modificaciones de los términos</h2>
        <p>
          Circulapp puede revisar estos Términos de Servicio para su Aplicación en cualquier momento sin previo aviso. Al usar esta Aplicación, usted acepta estar sujeto a la versión actual de estos Términos de Servicio.
        </p>

        <h2>6. Ley aplicable</h2>
        <p>
          Estos términos y condiciones se rigen e interpretan de acuerdo con las leyes de [Tu Jurisdicción] y te sometes irrevocablemente a la jurisdicción exclusiva de los tribunales de ese Estado o ubicación.
        </p>
      </div>
    </div>
  );
};

export default TermsOfService;
