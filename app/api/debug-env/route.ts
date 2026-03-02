import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

export async function GET() {
  const debug: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    cwd: process.cwd(),
  };

  // Check if .env.local exists and read it
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const envExists = fs.existsSync(envPath);
    debug.envFile = {
      path: envPath,
      exists: envExists,
    };
    
    if (envExists) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split('\n');
      debug.envFile.variables = lines
        .filter(line => line.trim() && !line.startsWith('#'))
        .map(line => {
          const [key] = line.split('=');
          return { key, exists: true };
        });
    }
  } catch (error) {
    debug.envFileError = String(error);
  }

  // Check all possible environment variable sources
  debug.processEnv = {
    NEXT_PUBLIC_SUPABASE_URL: {
      exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      value: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
        process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20) + '...' : 
        null,
      type: typeof process.env.NEXT_PUBLIC_SUPABASE_URL,
    },
    SUPABASE_SERVICE_ROLE_KEY: {
      exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
    },
    // Check common misspellings
    NEXT_PUBLIC_SUPABSE_URL: !!process.env.NEXT_PUBLIC_SUPABSE_URL,
    NEXT_PUBLIC_SUPABASEURL: !!process.env.NEXT_PUBLIC_SUPABASEURL,
    SUPABASE_URL: !!process.env.SUPABASE_URL,
  };

  // Try to create Supabase client and test connection
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Test 1: Simple query
      const { data, error } = await supabase
        .from('products')
        .select('count', { count: 'exact', head: true });

      debug.supabaseTest = {
        success: !error,
        error: error ? {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        } : null,
        data
      };

      // Test 2: List tables (requires higher privileges)
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

      debug.tablesTest = {
        success: !tablesError,
        error: tablesError,
        tables: tables?.map(t => t.table_name)
      };

    } catch (error) {
      debug.supabaseError = String(error);
    }
  } else {
    debug.clientCreation = 'Cannot create client - missing env vars';
  }

  // Get all environment variable names (safely)
  debug.allEnvKeys = Object.keys(process.env)
    .filter(key => key.includes('SUPABASE') || key.includes('supabase'))
    .sort();

  return NextResponse.json(debug);
}
