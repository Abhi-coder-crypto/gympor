[x] 1. Install the required packages - Completed with npm install --legacy-peer-deps (cross-env and all dependencies installed)
[x] 2. Setup environment variables - Already configured
[x] 3. Restart the workflow to see if the project is working - Workflow running successfully on port 5000
[x] 4. Verify the project is working - Frontend and backend both working correctly (FitPro Management System loaded with login page displaying)
[x] 5. Inform user the import is completed and they can start building, mark the import as completed using the complete_project_import tool - COMPLETED
[x] 6. Fix Vite HMR WebSocket errors - Disabled HMR to resolve WebSocket connection failures in Replit environment - COMPLETED
[x] 7. Re-verify after environment reset - All packages reinstalled and application verified working (November 30, 2025)
[x] 8. Fixed 502 Bad Gateway and WebSocket errors - Disabled HMR in vite.config.ts (set hmr: false). API endpoints working correctly. Application fully functional.
[x] 9. Added calories field to video upload system - Added calories column to videos table, updated upload form with calories input, updated client dashboard to calculate total calories from assigned videos (November 30, 2025)
[x] 10. Added calories field to edit video modal - Existing videos can now be edited to add or update calories, form displays calories field alongside duration/difficulty/intensity (November 30, 2025)
[x] 11. Implemented weight-based calorie calculation system - Changed schema from fixed calories to caloriePerMinute (decimal), updated upload/edit forms to show "Calories per Minute", implemented dashboard calculation: caloriePerMinute × duration × (clientWeight / 70) - now calories automatically adjust based on client's weight (November 30, 2025)