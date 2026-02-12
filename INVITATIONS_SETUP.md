# Configuración de Invitaciones y Compartir Boards

## Pasos para configurar la base de datos

1. **Ve a Supabase Dashboard** de tu proyecto
2. **Abre el SQL Editor**
3. **Copia y ejecuta el contenido del archivo** `supabase/migrations/create_invitations.sql`

## Lo que hace la migración

- Crea la tabla `board_members` para almacenar miembros del board
- Crea la tabla `board_invitations` para almacenar códigos de invitación
- Configura políticas de RLS para controlar acceso

## Características implementadas

### 1. Compartir Boards

- Botón "Compartir" en el menú de opciones del board
- Generar enlaces de invitación únicos
- Copiar enlace al portapapeles
- Revocar invitaciones activas

### 2. Aceptar Invitaciones

- Página `/invite/[code]` para aceptar invitaciones
- Validación de código, expiración
- Agregación automática del usuario como miembro

### 3. Gestionar Miembros

- Mostrar lista de miembros en el board
- Eliminar miembros (solo propietario)
- Mostrar rol de cada miembro

## Archivos creados/modificados

### Nuevos Archivos

- `/lib/actions/invitations.ts` - Server actions
- `/components/new_refactor/share-board-modal.tsx` - Modal de compartir
- `/components/new_refactor/board-members.tsx` - Visor de miembros
- `/app/invite/[code]/page.tsx` - Página para aceptar invitación
- `/supabase/migrations/create_invitations.sql` - Script SQL

### Archivos Modificados

- `/components/new_refactor/board-options-menu.tsx` - Agregar botón Compartir
- `/components/new_refactor/board-header.tsx` - Agregar componente de miembros
- `/app/board/[id]/page.tsx` - Pasar isOwner al header

## Uso

1. Para compartir un board: Click en "⋮" → "Compartir"
2. Click en "Generar Link de Invitación"
3. **Selecciona el rol**: Viewer (solo lectura), Editor (crear/editar), Owner (control total)
4. Copiar el enlace y enviarlo a otros usuarios
5. Otros usuarios pueden hacer click en el enlace y se unirán automáticamente

## ⚠️ IMPORTANTE: Políticas RLS para Roles

Para que funcionen correctamente los permisos, **es CRÍTICO ejecutar este SQL en Supabase**:

```sql
-- LIMPIAR políticas antiguas
DROP POLICY IF EXISTS "Users can view lists for their boards" ON lists;
DROP POLICY IF EXISTS "Members can view lists by role" ON lists;
DROP POLICY IF EXISTS "Editors can manage lists" ON lists;

-- NUEVAS políticas para LISTS
CREATE POLICY "Members can view lists"
  ON lists FOR SELECT
  USING (true);

CREATE POLICY "Only editors and owners can create lists"
  ON lists FOR INSERT
  WITH CHECK (
    board_id IN (
      SELECT id FROM boards WHERE owner_id = auth.uid()
      UNION
      SELECT board_id FROM board_members WHERE user_id = auth.uid() AND role IN ('editor', 'owner')
    )
  );

CREATE POLICY "Only editors and owners can update lists"
  ON lists FOR UPDATE
  USING (
    board_id IN (
      SELECT id FROM boards WHERE owner_id = auth.uid()
      UNION
      SELECT board_id FROM board_members WHERE user_id = auth.uid() AND role IN ('editor', 'owner')
    )
  )
  WITH CHECK (
    board_id IN (
      SELECT id FROM boards WHERE owner_id = auth.uid()
      UNION
      SELECT board_id FROM board_members WHERE user_id = auth.uid() AND role IN ('editor', 'owner')
    )
  );

CREATE POLICY "Only editors and owners can delete lists"
  ON lists FOR DELETE
  USING (
    board_id IN (
      SELECT id FROM boards WHERE owner_id = auth.uid()
      UNION
      SELECT board_id FROM board_members WHERE user_id = auth.uid() AND role IN ('editor', 'owner')
    )
  );

-- LIMPIAR políticas antiguas de CARDS
DROP POLICY IF EXISTS "Users can view cards for lists they can view" ON cards;
DROP POLICY IF EXISTS "Members can view cards by role" ON cards;
DROP POLICY IF EXISTS "Editors can manage cards" ON cards;

-- NUEVAS políticas para CARDS
CREATE POLICY "Members can view cards"
  ON cards FOR SELECT
  USING (true);

CREATE POLICY "Only editors and owners can create cards"
  ON cards FOR INSERT
  WITH CHECK (
    list_id IN (
      SELECT id FROM lists WHERE
        board_id IN (
          SELECT id FROM boards WHERE owner_id = auth.uid()
          UNION
          SELECT board_id FROM board_members WHERE user_id = auth.uid() AND role IN ('editor', 'owner')
        )
    )
  );

CREATE POLICY "Only editors and owners can update cards"
  ON cards FOR UPDATE
  USING (
    list_id IN (
      SELECT id FROM lists WHERE
        board_id IN (
          SELECT id FROM boards WHERE owner_id = auth.uid()
          UNION
          SELECT board_id FROM board_members WHERE user_id = auth.uid() AND role IN ('editor', 'owner')
        )
    )
  )
  WITH CHECK (
    list_id IN (
      SELECT id FROM lists WHERE
        board_id IN (
          SELECT id FROM boards WHERE owner_id = auth.uid()
          UNION
          SELECT board_id FROM board_members WHERE user_id = auth.uid() AND role IN ('editor', 'owner')
        )
    )
  );

CREATE POLICY "Only editors and owners can delete cards"
  ON cards FOR DELETE
  USING (
    list_id IN (
      SELECT id FROM lists WHERE
        board_id IN (
          SELECT id FROM boards WHERE owner_id = auth.uid()
          UNION
          SELECT board_id FROM board_members WHERE user_id = auth.uid() AND role IN ('editor', 'owner')
        )
    )
  );
```

## Lo que hace cada rol:

- **👁️ Viewer**: Solo puede ver listas y tarjetas. No puede crear, editar ni eliminar nada.
- **✏️ Editor**: Puede crear, editar y eliminar listas y tarjetas. No puede modificar el board.
- **👑 Owner**: Control total. Puede hacer todo incluyendo gestionar miembros y cambiar configuración.
