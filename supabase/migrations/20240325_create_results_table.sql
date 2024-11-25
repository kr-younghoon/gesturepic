-- Create results table
CREATE TABLE IF NOT EXISTS results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    result_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert results" ON results
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create policy to allow users to read their own results
CREATE POLICY "Allow users to read their own results" ON results
    FOR SELECT
    TO authenticated
    USING (true);

-- Add indexes
CREATE INDEX IF NOT EXISTS results_created_at_idx ON results (created_at DESC);
CREATE INDEX IF NOT EXISTS results_result_data_gin_idx ON results USING gin (result_data);

-- Add comments
COMMENT ON TABLE results IS 'Stores result data from the application';
COMMENT ON COLUMN results.result_data IS 'The JSON data containing the result information';
COMMENT ON COLUMN results.created_at IS 'Timestamp when the result was created';
