-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- Every exposed table has RLS enabled with explicit policies.
-- =============================================================================

-- Helper: check if the current user is a founder
CREATE OR REPLACE FUNCTION is_founder()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'founder'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if the current user is a member of an org
CREATE OR REPLACE FUNCTION is_org_member(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_memberships
    WHERE user_id = auth.uid()
      AND organization_id = org_id
      AND status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================================================
-- USER PROFILES
-- =============================================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Founders can read all profiles"
  ON user_profiles FOR SELECT
  USING (is_founder());

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (id = auth.uid());

-- =============================================================================
-- ORGANIZATIONS
-- =============================================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Founders can manage all orgs"
  ON organizations FOR ALL
  USING (is_founder());

CREATE POLICY "Members can read own org"
  ON organizations FOR SELECT
  USING (is_org_member(id));

-- =============================================================================
-- ORGANIZATION MEMBERSHIPS
-- =============================================================================
ALTER TABLE organization_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Founders can manage all memberships"
  ON organization_memberships FOR ALL
  USING (is_founder());

CREATE POLICY "Members can read own org memberships"
  ON organization_memberships FOR SELECT
  USING (is_org_member(organization_id));

-- =============================================================================
-- INVITATIONS
-- =============================================================================
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Founders can manage invitations"
  ON invitations FOR ALL
  USING (is_founder());

-- =============================================================================
-- PROJECTS
-- =============================================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Founders can manage all projects"
  ON projects FOR ALL
  USING (is_founder());

CREATE POLICY "Members can read org projects (client-visible)"
  ON projects FOR SELECT
  USING (
    is_org_member(organization_id)
    AND client_visible = true
  );

-- =============================================================================
-- PROJECT MEMBERSHIPS
-- =============================================================================
ALTER TABLE project_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Founders can manage project memberships"
  ON project_memberships FOR ALL
  USING (is_founder());

CREATE POLICY "Users can read own project memberships"
  ON project_memberships FOR SELECT
  USING (user_id = auth.uid());

-- =============================================================================
-- MILESTONES
-- =============================================================================
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Founders can manage milestones"
  ON milestones FOR ALL
  USING (is_founder());

CREATE POLICY "Members can read milestones of visible projects"
  ON milestones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = milestones.project_id
        AND p.client_visible = true
        AND is_org_member(p.organization_id)
    )
  );

-- =============================================================================
-- TASKS
-- =============================================================================
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Founders can manage all tasks"
  ON tasks FOR ALL
  USING (is_founder());

-- Clients can read tasks but NOT internal_notes or estimated_hours
-- (those fields are excluded from the client query, not the policy —
--  the policy blocks cross-org access; the query shape hides internal fields)
CREATE POLICY "Members can read org tasks (client-visible)"
  ON tasks FOR SELECT
  USING (
    is_org_member(organization_id)
    AND client_visible = true
  );

-- =============================================================================
-- DISCUSSIONS
-- =============================================================================
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Founders can manage all discussions"
  ON discussions FOR ALL
  USING (is_founder());

CREATE POLICY "Members can read non-internal discussions"
  ON discussions FOR SELECT
  USING (
    is_org_member(organization_id)
    AND is_internal = false
  );

CREATE POLICY "Members can create non-internal discussions"
  ON discussions FOR INSERT
  WITH CHECK (
    is_org_member(organization_id)
    AND is_internal = false
  );

-- =============================================================================
-- MESSAGES
-- =============================================================================
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Founders can manage all messages"
  ON messages FOR ALL
  USING (is_founder());

CREATE POLICY "Members can read messages of accessible discussions"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM discussions d
      WHERE d.id = messages.discussion_id
        AND d.is_internal = false
        AND is_org_member(d.organization_id)
    )
  );

CREATE POLICY "Members can create messages in accessible discussions"
  ON messages FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM discussions d
      WHERE d.id = messages.discussion_id
        AND d.is_internal = false
        AND is_org_member(d.organization_id)
    )
  );

-- =============================================================================
-- FILES
-- =============================================================================
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Founders can manage all files"
  ON files FOR ALL
  USING (is_founder());

CREATE POLICY "Members can read org files (client-visible)"
  ON files FOR SELECT
  USING (
    is_org_member(organization_id)
    AND client_visible = true
  );

-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Founders can read all notifications"
  ON notifications FOR SELECT
  USING (is_founder());

CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  USING (recipient_id = auth.uid());

CREATE POLICY "Users can update own notifications (mark read)"
  ON notifications FOR UPDATE
  USING (recipient_id = auth.uid());

-- =============================================================================
-- CONTACT INQUIRIES
-- =============================================================================
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Founders can manage inquiries"
  ON contact_inquiries FOR ALL
  USING (is_founder());

-- Public insert (no auth required) handled by service role in API route
-- so no anon insert policy needed

-- =============================================================================
-- AUDIT EVENTS (append-only for service role; read-only for founders)
-- =============================================================================
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Founders can read audit events"
  ON audit_events FOR SELECT
  USING (is_founder());

-- No insert/update/delete for authenticated users — only service role writes

-- =============================================================================
-- PRODUCTS
-- =============================================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Founders can manage products"
  ON products FOR ALL
  USING (is_founder());

-- Public can see active products (for hostname resolution)
CREATE POLICY "Active products are publicly readable"
  ON products FOR SELECT
  USING (status = 'active');

-- =============================================================================
-- HOSTNAME REGISTRY
-- =============================================================================
ALTER TABLE hostname_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Founders can manage hostname registry"
  ON hostname_registry FOR ALL
  USING (is_founder());

-- Read access for hostname resolution (needed by resolver)
CREATE POLICY "Anyone can read hostname registry"
  ON hostname_registry FOR SELECT
  USING (true);
