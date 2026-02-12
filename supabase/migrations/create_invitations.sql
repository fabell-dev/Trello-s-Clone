-- Create board_members table
CREATE TABLE IF NOT EXISTS board_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('viewer', 'editor', 'owner')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(board_id, user_id)
);

-- Create index on email
CREATE INDEX IF NOT EXISTS board_members_email_idx ON board_members(email);

-- Create board_invitations table
CREATE TABLE IF NOT EXISTS board_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  max_uses INTEGER DEFAULT NULL,
  uses_count INTEGER DEFAULT 0,
  role TEXT DEFAULT 'editor' CHECK (role IN ('viewer', 'editor', 'owner')),
  is_active BOOLEAN DEFAULT TRUE
);

-- Enable RLS
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for board_members
CREATE POLICY "Users can view board members"
  ON board_members FOR SELECT
  USING (true);

CREATE POLICY "Board owners can delete members"
  ON board_members FOR DELETE
  USING (
    board_id IN (SELECT id FROM boards WHERE owner_id = auth.uid())
  );

CREATE POLICY "Board owners can insert members"
  ON board_members FOR INSERT
  WITH CHECK (
    board_id IN (SELECT id FROM boards WHERE owner_id = auth.uid())
  );

-- RLS Policies for board_invitations
CREATE POLICY "Users can view invitations for their boards"
  ON board_invitations FOR SELECT
  USING (
    board_id IN (SELECT id FROM boards WHERE owner_id = auth.uid())
  );

CREATE POLICY "Any user can view active invitations by code"
  ON board_invitations FOR SELECT
  USING (
    is_active = true
  );

CREATE POLICY "Board owners can create invitations"
  ON board_invitations FOR INSERT
  WITH CHECK (
    board_id IN (SELECT id FROM boards WHERE owner_id = auth.uid())
  );

CREATE POLICY "Board owners can revoke invitations"
  ON board_invitations FOR UPDATE
  USING (
    board_id IN (SELECT id FROM boards WHERE owner_id = auth.uid())
  )
  WITH CHECK (
    board_id IN (SELECT id FROM boards WHERE owner_id = auth.uid())
  );

-- RLS Policies for boards (allow members to view boards)
CREATE POLICY "Board members can view boards"
  ON boards FOR SELECT
  USING (
    owner_id = auth.uid()
    OR id IN (SELECT board_id FROM board_members WHERE user_id = auth.uid())
  );

-- RLS Policies for lists (enforce role-based access)
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

-- RLS Policies for cards (enforce role-based access)
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
