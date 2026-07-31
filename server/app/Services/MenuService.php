<?php

namespace App\Services;

use App\Models\Menu;
use App\Repositories\Interfaces\MenuRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;

/**
 * Class MenuService
 * Service layer for Menu business logic.
 */
class MenuService
{
    public function __construct(
        protected MenuRepositoryInterface $menuRepository
    ) {}

    /**
     * Get paginated list of menus with search, sort, filter, and relations.
     *
     * @param int $perPage
     * @param string|null $search
     * @param string $sortBy
     * @param string $sortOrder
     * @param array $filters
     * @return LengthAwarePaginator
     */
    public function getPaginated(
        int $perPage = 15,
        ?string $search = null,
        string $sortBy = 'id',
        string $sortOrder = 'desc',
        array $filters = []
    ): LengthAwarePaginator {
        return $this->menuRepository->getPaginated(
            perPage: $perPage,
            relations: ['category'],
            search: $search,
            searchableFields: ['name', 'description'],
            sortBy: $sortBy,
            sortOrder: $sortOrder,
            filters: $filters
        );
    }

    /**
     * Create a new menu.
     *
     * @param array $data
     * @param UploadedFile|null $image
     * @return Menu
     */
    public function createMenu(array $data, ?UploadedFile $image = null): Menu
    {
        if ($image) {
            $data['image_url'] = $image->store('menus', 'public');
        }

        /** @var Menu $menu */
        $menu = $this->menuRepository->create($data);
        return $menu->load('category');
    }

    /**
     * Get menu by ID.
     *
     * @param int|string $id
     * @return Menu
     */
    public function getMenuById(int|string $id): Menu
    {
        $menu = $this->menuRepository->findById($id, ['category']);

        if (!$menu) {
            abort(404, 'Menu item not found.');
        }

        return $menu;
    }

    /**
     * Update an existing menu.
     *
     * @param int|string $id
     * @param array $data
     * @param UploadedFile|null $image
     * @return Menu
     */
    public function updateMenu(int|string $id, array $data, ?UploadedFile $image = null): Menu
    {
        $existing = $this->getMenuById($id);

        if ($image) {
            if ($existing->image_url && Storage::disk('public')->exists($existing->image_url)) {
                Storage::disk('public')->delete($existing->image_url);
            }
            $data['image_url'] = $image->store('menus', 'public');
        }

        /** @var Menu $updatedMenu */
        $updatedMenu = $this->menuRepository->update($id, $data);
        return $updatedMenu->load('category');
    }

    /**
     * Delete a menu item.
     *
     * @param int|string $id
     * @return bool
     */
    public function deleteMenu(int|string $id): bool
    {
        return $this->menuRepository->delete($id);
    }
}
