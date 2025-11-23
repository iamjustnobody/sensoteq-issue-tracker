import pool from "../config/database.js";
import type {
  Issue,
  CreateIssueDTO,
  UpdateIssueDTO,
  IssueFilters,
  AnalyticsData,
} from "../types/issue.types.js";
import { NotFoundError } from "../utils/ApiError.js";

class IssueService {
  /**
   * Get all issues with optional filtering
   */
  async findAll(filters: IssueFilters): Promise<Issue[]> {
    let query = "SELECT * FROM issues WHERE 1=1";
    const params: unknown[] = [];

    if (filters.status) {
      params.push(filters.status);
      query += ` AND status = $${params.length}`;
    }

    if (filters.search) {
      params.push(`%${filters.search}%`);
      query += ` AND (title ILIKE $${params.length} OR description ILIKE $${params.length})`;
    }

    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, params);
    return result.rows as Issue[];
  }

  /**
   * Get single issue by ID
   */
  async findById(id: number): Promise<Issue> {
    const result = await pool.query("SELECT * FROM issues WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      throw new NotFoundError(`Issue with id ${id} not found`);
    }

    return result.rows[0] as Issue;
  }

  /**
   * Create new issue
   */
  async create(data: CreateIssueDTO): Promise<Issue> {
    const { title, description, status = "not-started", progress = 0 } = data;

    const result = await pool.query(
      `INSERT INTO issues (title, description, status, progress) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [title, description || null, status, progress]
    );

    return result.rows[0] as Issue;
  }

  /**
   * Update existing issue
   */
  async update(id: number, data: UpdateIssueDTO): Promise<Issue> {
    // First check if issue exists
    await this.findById(id);

    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.title !== undefined) {
      values.push(data.title);
      fields.push(`title = $${values.length}`);
    }
    if (data.description !== undefined) {
      values.push(data.description);
      fields.push(`description = $${values.length}`);
    }
    if (data.status !== undefined) {
      values.push(data.status);
      fields.push(`status = $${values.length}`);
    }
    if (data.progress !== undefined) {
      values.push(data.progress);
      fields.push(`progress = $${values.length}`);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE issues SET ${fields.join(", ")} WHERE id = $${
        values.length
      } RETURNING *`,
      values
    );

    return result.rows[0] as Issue;
  }

  /**
   * Delete issue
   */
  async delete(id: number): Promise<Issue> {
    const issue = await this.findById(id);

    await pool.query("DELETE FROM issues WHERE id = $1", [id]);

    return issue;
  }

  /**
   * Get analytics data
   */
  async getAnalytics(): Promise<AnalyticsData> {
    // Status distribution
    const statusResult = await pool.query(`
      SELECT status, COUNT(*)::int as count 
      FROM issues 
      GROUP BY status
    `);

    // Average progress
    const avgResult = await pool.query(`
      SELECT COALESCE(ROUND(AVG(progress)), 0)::int as avg_progress 
      FROM issues
    `);

    // Recent activity (last 7 days)
    const activityResult = await pool.query(`
      SELECT DATE(created_at)::text as date, COUNT(*)::int as count 
      FROM issues 
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at) 
      ORDER BY date
    `);

    // Completion rate
    const completionResult = await pool.query(`
      SELECT 
        COALESCE(
          ROUND(COUNT(*) FILTER (WHERE status = 'completed') * 100.0 / NULLIF(COUNT(*), 0)),
          0
        )::int as rate,
        COUNT(*)::int as total
      FROM issues
    `);

    const row = completionResult.rows[0] as
      | { rate: number; total: number }
      | undefined;

    return {
      statusDistribution: statusResult.rows as {
        status: string;
        count: number;
      }[],
      averageProgress:
        (avgResult.rows[0] as { avg_progress: number } | undefined)
          ?.avg_progress || 0,
      recentActivity: activityResult.rows as { date: string; count: number }[],
      completionRate: row?.rate || 0,
      totalIssues: row?.total || 0,
    };
  }
}

const issueService = new IssueService();
export default issueService;
