# Toronto Property Hunter Plan (Rent & Buy)

## Target Platforms
1. **Realtor.ca** (MLS listings for both Rent & Buy)
2. **51.ca (51找房)** (Chinese community focus - Private rentals & MLS sync)
3. **HouseSigma** (Sold data and market trends - if accessible)

## Core Logic
- **Dual-Mode Scraper**:
  - **Rental Mode**: Monitor 51.ca and Realtor.ca for new apartment/house rentals.
  - **Buying Mode**: Monitor Realtor.ca for new listings, price drops, and "Hot Deals".
- **Chinese Market Focus**: 
  - Scan for specific keywords: "学区房" (School district), "近地铁" (Near subway), "包水电" (All-inclusive), "投资潜力" (Investment potential).
  - Target areas: Downtown Toronto, North York, Markham, Richmond Hill.

## Output
- **Real-time Telegram Alerts**: Immediate notification for new "Rent" or "Buy" listings matching criteria.
- **Unified Database**: A Google Sheet tracking both rental yields and buying prices for comparison.

## Next Steps
- Implement specific scrapers for both 'For Rent' and 'For Sale' sections on 51.ca and Realtor.ca.
- Build the comparison logic (e.g., Rent vs. Buy analysis).
