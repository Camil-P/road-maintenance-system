import React from "react";
import { AppLayout } from "./components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";

function App() {
  return (
    <AppLayout>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This is a placeholder for the Road Maintenance System dashboard.
              Upcoming phases will add authentication, incidents, work orders, and reporting.
            </p>
            <div className="mt-4">
              <Button>Primary action</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export default App;
