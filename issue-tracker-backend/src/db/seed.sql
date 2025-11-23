-- Clear existing data
TRUNCATE TABLE issues RESTART IDENTITY;

-- Insert seed data
INSERT INTO issues (title, description, status, progress) VALUES
('Setup project structure', 'Initialize the repository with proper folder structure and configure build tools', 'completed', 100),
('Design database schema', 'Create PostgreSQL tables for issues with proper indexes and constraints', 'completed', 100),
('Implement REST API', 'Build CRUD endpoints for issue management with proper error handling', 'in-progress', 60),
('Build React frontend', 'Create UI components using React and TypeScript with Tailwind CSS', 'in-progress', 40),
('Add authentication', 'Implement JWT-based user authentication and authorization', 'not-started', 0),
('Write unit tests', 'Add Jest test coverage for services and controllers', 'not-started', 0),
('Setup CI/CD pipeline', 'Configure GitHub Actions for automated testing and deployment', 'not-started', 0),
('Deploy to production', 'Setup AWS/Vercel infrastructure and deploy application', 'not-started', 0);