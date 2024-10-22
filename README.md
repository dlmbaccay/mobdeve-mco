# Bike Safe

### MOBDEVE Android Application Project

### Description
Bike App is a mobile application designed for cyclists to easily report various road conditions, such as traffic congestion, road hazards, or construction areas. By mapping these incidents, cyclists can share valuable information with the community, helping to improve safety and navigation for all road users.


### Github Repository:
https://github.com/dlmbaccay/mobdeve-mco

### APK (Preview Build):
[mobdeve-mco2-bike-app.apk]()

### Technologies Used:
- React Native (Expo)
- Firebase (Firestore, Authentication, Storage)
- Google Maps SDK For Android
- React Native Paper

### Features:

- Report Road Conditions: Easily report traffic, hazards, or construction areas on the map.
- Map View: Visualize reported incidents on a real-time map.
- Community Sharing: Contribute to a shared knowledge base of road conditions.
- Profile: Manage your account

### How to Use:
- <b>Create a Report</b>
  - Long press on any visible part of the map view.
- <b>Add a Report on the same location</b>
  - Click on an existing marker (existing report) to view the report and click on "Add Report" to stack a report on the same location.
- <b>Edit/Delete a Report</b>
  - To edit or delete a report, click on the existing marker again to view the report and select the "edit/delete" icon beside the report you created (only applicable to own reports).

### Note
Reported incidents will appear on the map for other users to view and avoid.

### Additional Information
All API keys and Google files related to Firebase and Google Maps are stored within EAS Secrets.