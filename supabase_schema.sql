-- =========================================================
-- ESQUEMA COMPLETO DE BASE DE DATOS PARA YAPCITY (SUPABASE)
-- =========================================================

-- 1. Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla de Categorías
CREATE TABLE IF NOT EXISTS public.categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    icono VARCHAR(50) DEFAULT 'briefcase',
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Tabla de Perfiles de Usuario (Extiende auth.users)
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    correo VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    ubicacion VARCHAR(100) DEFAULT 'Santa Cruz',
    tipo_usuario VARCHAR(20) DEFAULT 'usuario' CHECK (tipo_usuario IN ('usuario', 'proveedor', 'admin')),
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Tabla de Publicaciones (Trabajos solicitados)
CREATE TABLE IF NOT EXISTS public.publicaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    categoria_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    ubicacion VARCHAR(100) NOT NULL DEFAULT 'Santa Cruz',
    estado VARCHAR(50) DEFAULT 'Disponible' CHECK (estado IN ('Disponible', 'En proceso', 'Completado')),
    precio NUMERIC(10, 2), -- Precio en Bolivianos (Bs)
    fecha_publicacion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Tabla de Servicios (Ofrecidos por Proveedores)
CREATE TABLE IF NOT EXISTS public.servicios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    categoria_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    precio_desde NUMERIC(10, 2) NOT NULL, -- En Bs
    disponibilidad VARCHAR(100) DEFAULT 'Siempre disponible',
    ubicacion VARCHAR(100) NOT NULL DEFAULT 'Santa Cruz',
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Tabla de Imágenes de Publicaciones y Servicios
CREATE TABLE IF NOT EXISTS public.imagenes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publicacion_id UUID REFERENCES public.publicaciones(id) ON DELETE CASCADE,
    servicio_id UUID REFERENCES public.servicios(id) ON DELETE CASCADE,
    url_imagen TEXT NOT NULL,
    fecha_subida TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. Tabla de Favoritos
CREATE TABLE IF NOT EXISTS public.favoritos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    publicacion_id UUID REFERENCES public.publicaciones(id) ON DELETE CASCADE,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(usuario_id, publicacion_id)
);

-- 8. Disparador automático para crear perfil cuando alguien se registra en Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS \$\$
BEGIN
  INSERT INTO public.usuarios (id, nombre, apellido, correo, tipo_usuario)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'apellido', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'tipo_usuario', 'usuario')
  );
  RETURN NEW;
END;
\$\$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Políticas de Seguridad RLS (Row Level Security)
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publicaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imagenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública para todos
CREATE POLICY "Categorías son públicas" ON public.categorias FOR SELECT USING (true);
CREATE POLICY "Perfiles públicos para lectura" ON public.usuarios FOR SELECT USING (true);
CREATE POLICY "Publicaciones visibles para todos" ON public.publicaciones FOR SELECT USING (true);
CREATE POLICY "Servicios visibles para todos" ON public.servicios FOR SELECT USING (true);
CREATE POLICY "Imágenes visibles para todos" ON public.imagenes FOR SELECT USING (true);

-- Políticas de escritura para usuarios autenticados
CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON public.usuarios FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Usuarios pueden crear publicaciones" ON public.publicaciones FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Usuarios pueden editar sus publicaciones" ON public.publicaciones FOR UPDATE USING (auth.uid() = usuario_id);
CREATE POLICY "Usuarios pueden eliminar sus publicaciones" ON public.publicaciones FOR DELETE USING (auth.uid() = usuario_id);

CREATE POLICY "Proveedores pueden crear servicios" ON public.servicios FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Proveedores pueden editar sus servicios" ON public.servicios FOR UPDATE USING (auth.uid() = usuario_id);
CREATE POLICY "Proveedores pueden eliminar sus servicios" ON public.servicios FOR DELETE USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden gestionar sus favoritos" ON public.favoritos FOR ALL USING (auth.uid() = usuario_id);

-- 10. Datos iniciales (Seed Data)
INSERT INTO public.categorias (nombre, descripcion) VALUES
('Diseño gráfico', 'Logotipos, branding, piezas publicitarias y diseño UI/UX'),
('Carpintería', 'Muebles a medida, reparaciones de madera y acabados'),
('Edición de video', 'Reels, YouTube, comerciales y producción audiovisual'),
('Pintura de interiores', 'Pintura de casas, oficinas, empastado y acabados'),
('Construcción', 'Albañilería, remodelación de casas y obras civiles'),
('Clases particulares', 'Inglés, matemáticas y refuerzo escolar')
ON CONFLICT (nombre) DO NOTHING;
