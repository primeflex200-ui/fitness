import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SupabaseTest() {
  const [status, setStatus] = useState<string>('Testing...');
  const [details, setDetails] = useState<any>({});

  const testConnection = async () => {
    setStatus('Testing connection...');
    const results: any = {};

    // Test 1: Check environment variables
    results.envUrl = import.meta.env.VITE_SUPABASE_URL || 'MISSING';
    results.envKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'Present' : 'MISSING';

    // Test 2: Try to fetch from Supabase
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (error) {
        results.queryTest = `Error: ${error.message}`;
      } else {
        results.queryTest = 'Success!';
      }
    } catch (err: any) {
      results.queryTest = `Exception: ${err.message}`;
    }

    // Test 3: Check auth status
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        results.authTest = `Error: ${error.message}`;
      } else {
        results.authTest = session ? 'Logged in' : 'Not logged in';
      }
    } catch (err: any) {
      results.authTest = `Exception: ${err.message}`;
    }

    // Test 4: Network test
    try {
      const response = await fetch(import.meta.env.VITE_SUPABASE_URL + '/rest/v1/', {
        method: 'HEAD',
      });
      results.networkTest = `Status: ${response.status}`;
    } catch (err: any) {
      results.networkTest = `Failed: ${err.message}`;
    }

    setDetails(results);
    setStatus('Tests complete');
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Supabase Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-lg font-semibold">{status}</div>
          
          <div className="space-y-2">
            <div className="p-3 bg-muted rounded">
              <strong>Environment URL:</strong> {details.envUrl}
            </div>
            <div className="p-3 bg-muted rounded">
              <strong>Environment Key:</strong> {details.envKey}
            </div>
            <div className="p-3 bg-muted rounded">
              <strong>Database Query Test:</strong> {details.queryTest}
            </div>
            <div className="p-3 bg-muted rounded">
              <strong>Auth Test:</strong> {details.authTest}
            </div>
            <div className="p-3 bg-muted rounded">
              <strong>Network Test:</strong> {details.networkTest}
            </div>
          </div>

          <Button onClick={testConnection} className="w-full">
            Run Tests Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
