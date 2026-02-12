-- Role-based RLS Policies for Lists
-- Viewers can only view lists
CREATE POLICY "Viewers can view lists"
  ON lists FOR SELECT
  USING (
    board_id IN (
      SELECT board_id FROM board_members 
      WHERE user_id = auth.uid() AND role IN ('viewer', 'editor', 'owner')
    )
    OR
    board_id IN (
      SELECT id FROM boards WHERE owner_id = auth.uid()
    )
  );

-- Editors and owners can manage lists
CREATE POLICY "Editors can manage lists"
  ON lists FOR ALL
  USING (
    board_id IN (
      SELECT board_id FROM board_members 
      WHERE user_id = auth.uid() AND role IN ('editor', 'owner')
    )
    OR
    board_id IN (
      SELECT id FROM boards WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    board_id IN (
      SELECT board_id FROM board_members 
      WHERE user_id = auth.uid() AND role IN ('editor', 'owner')
    )
    OR
    board_id IN (
      SELECT id FROM boards WHERE owner_id = auth.uid()
    )
  );

-- Role-based RLS Policies for Cards
-- Viewers can only view cards
CREATE POLICY "Viewers can view cards"
  ON cards FOR SELECT
  USING (
    list_id IN (
      SELECT id FROM lists WHERE board_id IN (
        SELECT board_id FROM board_members 
        WHERE user_id = auth.uid() AND role IN ('viewer', 'editor', 'owner')
      )
      OR
      board_id IN (
        SELECT id FROM boards WHERE owner_id = auth.uid()
      )
    )
  );

-- Editors and owners can manage cards
CREATE POLICY "Editors can manage cards"
  ON cards FOR ALL
  USING (
    list_id IN (
      SELECT id FROM lists WHERE board_id IN (
        SELECT board_id FROM board_members 
        WHERE user_id = auth.uid() AND role IN ('editor', 'owner')
      )
      OR
      board_id IN (
        SELECT id FROM boards WHERE owner_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    list_id IN (
      SELECT id FROM lists WHERE board_id IN (
        SELECT board_id FROM board_members 
        WHERE user_id = auth.uid() AND role IN ('editor', 'owner')
      )
      OR
      board_id IN (
        SELECT id FROM boards WHERE owner_id = auth.uid()
      )
    )
  );
